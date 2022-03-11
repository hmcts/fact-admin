import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
//import {SelectItem} from '../../../types/CourtPageData';
//import {EmailType} from '../../../types/EmailType';
//import {validateDuplication, validateEmailFormat} from '../../../utils/validation';
//import {CSRF} from '../../../modules/csrf';
//import {Error} from '../../../types/Error';
import {ApplicationProgression, ApplicationProgressionData} from '../../../types/ApplicationProgression';
import {Error} from '../../../types/Error';
//import {app} from "../../../server";

@autobind
export class ApplicationProgressionController {

  emptyTypeOrAddressErrorMsg = 'Description and address are required for all emails.';
  updateErrorMsg = 'A problem occurred when saving the emails.';
  emailDuplicatedErrorMsg = 'All email addresses must be unique.'
  getEmailsErrorMsg = 'A problem occurred when retrieving the emails.';
  getEmailTypesErrorMsg = 'A problem occurred when retrieving the email descriptions.';
  getEmailAddressFormatErrorMsg = 'Enter an email address in the correct format, like name@example.com';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsg: string[] = [],
    applicationUpdates: ApplicationProgression[] = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!applicationUpdates) {
      // Get application updates from API and set the isNew property to false on all application update entries.
      await req.scope.cradle.api.getApplicationUpdates(slug)
        .then((value: ApplicationProgression[]) => applicationUpdates = value.map(e => { e.isNew = false; return e; }))
        .catch(() => errorMsg.push(this.getEmailsErrorMsg));
    }

    if (!applicationUpdates?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(applicationUpdates);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: ApplicationProgressionData = {
      'application_progression': applicationUpdates,
      errors: errors,
      updated: updated
    };

    console.log(pageData);

    res.render('courts/tabs/applicationProgressionContent', pageData);
  }

  private addEmptyFormsForNewEntries(applicationUpdates: ApplicationProgression[], numberOfForms = 1): void {
    if (applicationUpdates) {
      for (let i = 0; i < numberOfForms; i++) {
        applicationUpdates.push({ type: null, email: null, external_link: null, external_link_description: null, isNew: true });
      }
    }
  }

}
/*










  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let emails = req.body.emails as Email[] ?? [];
    emails.forEach(e => e.isNew = (e.isNew === true) || ((e.isNew as any) === 'true'));

    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [this.updateErrorMsg], emails);
    }

    // Remove fully empty entries
    emails = emails.filter(e => !this.emailEntryIsEmpty(e));

    const errorMsg = this.getErrorMessages(emails);
    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, emails);
    }

    await req.scope.cradle.api.updateEmails(req.params.slug, emails)
      .then((value: Email[]) => this.get(req, res, true, [], value))
      .catch((err: any) => this.get(req, res, false, [this.updateErrorMsg], emails));
  }

  private static getEmailTypesForSelect(standardTypes: EmailType[]): SelectItem[] {
    return standardTypes.map((ott: EmailType) => (
      {value: ott.id, text: ott.description, selected: false}));
  }



  private emailEntryIsEmpty(email: Email): boolean {
    return (!email.adminEmailTypeId && !email.address?.trim() && !email.explanation?.trim() && !email.explanationCy?.trim());
  }

  private emailsDuplicated(emails: Email[], index1: number, index2: number): boolean {
    return emails[index1].address && emails[index1].address.toLowerCase() === emails[index2].address.toLowerCase();
  }

  private getErrorMessages(emails: Email[]): string[] {
    const errorMsg: string[] = [];
    if (emails.some(ot => !ot.adminEmailTypeId || ot.address === '')) {
      // Retains the posted email data when errors exist
      errorMsg.push(this.emptyTypeOrAddressErrorMsg);
    }

    // If any address used is not of an email format, return with an error
    if (!validateEmailFormat(emails)) {
      errorMsg.push(this.getEmailAddressFormatErrorMsg);
    }

    if (!validateDuplication(emails, this.emailsDuplicated)) {
      errorMsg.push(this.emailDuplicatedErrorMsg);
    }
    return errorMsg;
  }
}
*/
