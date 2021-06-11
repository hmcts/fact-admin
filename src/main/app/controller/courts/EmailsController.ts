import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';
import {Email, EmailData} from '../../../types/Email';
import {EmailType} from '../../../types/EmailType';
import {validateEmail} from '../../../utils/validation';
import {CSRF} from '../../../modules/csrf';

@autobind
export class EmailsController {

  private emptyTypeOrAddressErrorMsg = 'Type and address are required for all emails.';
  private updateErrorMsg = 'A problem occurred when saving the emails.';
  getEmailsErrorMsg = 'A problem occurred when retrieving the emails.';
  getEmailTypesErrorMsg = 'A problem occurred when retrieving the email types.';
  getEmailAddressFormatErrorMsg = 'Enter an email address in the correct format, like name@example.com';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    emails: Email[] = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!emails) {
      // Get emails from API and set the isNew property to false on all email entries.
      await req.scope.cradle.api.getEmails(slug)
        .then((value: Email[]) => emails = value.map(e => { e.isNew = false; return e; }))
        .catch(() => error += this.getEmailsErrorMsg);
    }

    let types: EmailType[] = [];
    await req.scope.cradle.api.getEmailTypes()
      .then((value: EmailType[]) => types = value)
      .catch(() => error += this.getEmailTypesErrorMsg);

    if (!emails?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(emails);
    }

    const pageData: EmailData = {
      'emails': emails,
      emailTypes: EmailsController.getEmailTypesForSelect(types),
      errorMsg: error,
      updated: updated
    };
    res.render('courts/tabs/emailsContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let emails = req.body.emails as Email[] ?? [];
    emails.forEach(e => e.isNew = (e.isNew === true) || ((e.isNew as any) === 'true'));

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, this.updateErrorMsg, emails);
    }

    // Remove fully empty entries
    emails = emails.filter(e => !this.emailEntryIsEmpty(e));

    if (emails.some(ot => !ot.adminEmailTypeId || ot.address === '')) {
      // Retains the posted email data when errors exist
      return this.get(req, res, false, this.emptyTypeOrAddressErrorMsg, emails);
    } else {

      // If any address used is not of an email format, return with an error
      if(emails.some(ot => !validateEmail(ot.address)))
        return this.get(req, res, false, this.getEmailAddressFormatErrorMsg, emails);

      await req.scope.cradle.api.updateEmails(req.params.slug, emails)
        .then((value: Email[]) => this.get(req, res, true, '', value))
        .catch((err: any) => this.get(req, res, false, this.updateErrorMsg, emails));
    }
  }

  private static getEmailTypesForSelect(standardTypes: EmailType[]): SelectItem[] {
    return standardTypes.map((ott: EmailType) => (
      {value: ott.id, text: ott.description, selected: false}));
  }

  private addEmptyFormsForNewEntries(emails: Email[], numberOfForms = 1): void {
    if (emails) {
      for (let i = 0; i < numberOfForms; i++) {
        emails.push({ adminEmailTypeId: null, address: null, explanation: null, explanationCy: null, isNew: true });
      }
    }
  }

  private emailEntryIsEmpty(email: Email): boolean {
    return (!email.adminEmailTypeId && !email.address?.trim() && !email.explanation?.trim() && !email.explanationCy?.trim());
  }
}
