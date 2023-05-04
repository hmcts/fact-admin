import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';
import {Email, EmailData} from '../../../types/Email';
import {EmailType} from '../../../types/EmailType';
import {validateDuplication, validateEmailFormat} from '../../../utils/validation';
import {CSRF} from '../../../modules/csrf';
import {Error} from '../../../types/Error';
import {AxiosError} from 'axios';

@autobind
export class EmailsController {

  emptyTypeOrAddressErrorMsg = 'Description and address are required for all emails.';
  updateErrorMsg = 'A problem occurred when saving the emails.';
  emailDuplicatedErrorMsg = 'All email addresses must be unique.';
  getEmailsErrorMsg = 'A problem occurred when retrieving the emails.';
  getEmailTypesErrorMsg = 'A problem occurred when retrieving the email descriptions.';
  getEmailAddressFormatErrorMsg = 'Enter an email address in the correct format, like name@example.com';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';
  /**
   * GET /courts/:slug/emails
   * render the view with data from database for court emails tab
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsg: string[] = [],
    emails: Email[] = null): Promise<void> {

    const slug: string = req.params.slug;
    let fatalError = false;

    if (!emails) {
      // Get emails from API and set the isNew property to false on all email entries.
      await req.scope.cradle.api.getEmails(slug)
        .then((value: Email[]) => emails = value.map(e => { e.isNew = false; return e; }))
        .catch(() => {errorMsg.push(this.getEmailsErrorMsg); fatalError = true;});
    }

    let types: EmailType[] = [];
    await req.scope.cradle.api.getEmailTypes()
      .then((value: EmailType[]) => types = value)
      .catch(() => {errorMsg.push(this.getEmailTypesErrorMsg); fatalError = true;});

    if (!emails?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(emails);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: EmailData = {
      'emails': emails,
      emailTypes: EmailsController.getEmailTypesForSelect(types),
      errors: errors,
      updated: updated,
      fatalError: fatalError
    };
    res.render('courts/tabs/emailsContent', pageData);
  }
  /**
   * PUT /courts/:slug/emails
   * validate input data and update the courts emails then re-render the view
   */
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
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.updateErrorMsg;
        await this.get(req, res, false, [error], emails);
      });
  }

  private static getEmailTypesForSelect(standardTypes: EmailType[]): SelectItem[] {
    return standardTypes.map((ott: EmailType) => (
      {value: ott.id, text: ott.description, selected: false}));
  }
  /**
   * adds an empty form so the view is rendered with one blank form
   */
  private addEmptyFormsForNewEntries(emails: Email[], numberOfForms = 1): void {
    if (emails) {
      for (let i = 0; i < numberOfForms; i++) {
        emails.push({ adminEmailTypeId: null, address: null, explanation: null, explanationCy: null, isNew: true });
      }
    }
  }
  /**
   * check if email entry is empty
   */
  private emailEntryIsEmpty(email: Email): boolean {
    return (!email.adminEmailTypeId && !email.address?.trim() && !email.explanation?.trim() && !email.explanationCy?.trim());
  }
  /**
   * check if email entry is duplicated
   */
  private emailsDuplicated(emails: Email[], index1: number, index2: number): boolean {
    return emails[index1].address && emails[index1].address.toLowerCase() === emails[index2].address.toLowerCase();
  }
  /**
   * returns the error messages to the view
   */
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
