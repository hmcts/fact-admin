import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {ApplicationProgression, ApplicationProgressionData} from '../../../types/ApplicationProgression';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';
import {validateDuplication} from '../../../utils/validation';
//import {app} from "../../../server";
//validateEmailFormat
@autobind
export class ApplicationProgressionController {

  error1 = 'error with CSRF';
  error2 = 'error with PUT';
  emptyTypeErrorMsg = 'Type is needed for all application progressions.';
  updateErrorMsg = 'A problem occurred when saving the application progression.';
  emailDuplicatedErrorMsg = 'All email addresses must be unique.'
  getApplicationUpdatesErrorMsg = 'A problem occurred when retrieving the application progressions.';
  //getEmailTypesErrorMsg = 'A problem occurred when retrieving the email descriptions.';
  getEmailAddressFormatErrorMsg = 'Enter an email address in the correct format, like name@example.com';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsg: string[] = [],
    applicationProgressions: ApplicationProgression[] = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!applicationProgressions) {
      // Get application updates from API and set the isNew property to false on all application update entries.
      await req.scope.cradle.api.getApplicationUpdates(slug)
        .then((value: ApplicationProgression[]) => applicationProgressions = value.map(e => { e.isNew = false; return e; }))
        .catch(() => errorMsg.push(this.getApplicationUpdatesErrorMsg));
    }

    if (!applicationProgressions?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(applicationProgressions);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: ApplicationProgressionData = {
      'application_progression': applicationProgressions,
      errors: errors,
      updated: updated
    };

    console.log(pageData);

    res.render('courts/tabs/applicationProgressionContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let applicationProgressions = req.body.progression as ApplicationProgression[] ?? [];
    applicationProgressions.forEach(e => e.isNew = (e.isNew === true) || ((e.isNew as any) === 'true'));

    //console.log('req: ', req);
    //console.log('res: ', res);
    console.log('PUT', applicationProgressions);

    console.log('---');



    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [this.error1], applicationProgressions);
    }

    // Remove fully empty entries
    applicationProgressions = applicationProgressions.filter(e => !this.applicationProgressionEntryIsEmpty(e));

    const errorMsg = this.getErrorMessages(applicationProgressions);
    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, applicationProgressions);
    }

    await req.scope.cradle.api.updateApplicationUpdates(req.params.slug, applicationProgressions)
      .then((value: ApplicationProgression[]) => this.get(req, res, true, [], value))
      .catch((err: any) => this.get(req, res, false, [this.error2], applicationProgressions));
  }


  private addEmptyFormsForNewEntries(applicationProgressions: ApplicationProgression[], numberOfForms = 1): void {
    if (applicationProgressions) {
      for (let i = 0; i < numberOfForms; i++) {
        applicationProgressions.push({ type: null, email: null, external_link: null, external_link_description: null, isNew: true });
      }
    }
  }

  private applicationProgressionEntryIsEmpty(applicationProgressions: ApplicationProgression): boolean {
    return (!applicationProgressions.type && !applicationProgressions.email?.trim() && !applicationProgressions.external_link?.trim() && !applicationProgressions.external_link_description?.trim());
  }

  private getErrorMessages(applicationProgressions: ApplicationProgression[]): string[] {
    const errorMsg: string[] = [];
    if (applicationProgressions.some(ot => !ot.type)) {
      // Retains the posted email data when errors exist
      errorMsg.push(this.emptyTypeErrorMsg);
    }

    // If any address used is not of an email format, return with an error
    //if (!validateEmailFormat(applicationUpdates)) {
    //  errorMsg.push(this.getEmailAddressFormatErrorMsg);
    //}

    if (!validateDuplication(applicationProgressions, this.emailsDuplicated)) {
      errorMsg.push(this.emailDuplicatedErrorMsg);
    }
    return errorMsg;
  }

  private emailsDuplicated(applicationProgressions: ApplicationProgression[], index1: number, index2: number): boolean {
    return applicationProgressions[index1].email && applicationProgressions[index1].email.toLowerCase() === applicationProgressions[index2].email.toLowerCase();
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
