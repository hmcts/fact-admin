import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {ApplicationProgression, ApplicationProgressionData} from '../../../types/ApplicationProgression';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';
import {validateDuplication, validateStringEmailFormat, validateUrlFormat} from '../../../utils/validation';
import {CourtGeneralInfo} from '../../../types/CourtGeneralInfo';

@autobind
export class ApplicationProgressionController {

  emptyTypeErrorMsg = 'Type is needed for all application progressions.';
  emptyFieldsErrorMsg = 'Enter an email address or an external link';
  linkFieldsErrorMsg = 'Description and link are required to add an external link';
  updateErrorMsg = 'A problem occurred when saving the application progression.';
  emailDuplicatedErrorMsg = 'All email addresses must be unique.';
  getApplicationUpdatesErrorMsg = 'A problem occurred when retrieving the application progressions.';
  invalidEmailFormatErrorMsg = 'Enter an email address in the correct format, like name@example.com';
  invalidUrlFormatErrorMsg = 'All URLs must be in valid format';
  doubleInputErrorMsg = 'Enter either an email address or an external link per application progression';

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
        .then((value: ApplicationProgression[]) => applicationProgressions = value.map(e => {
          e.isNew = false; return e; }))
        .catch(() => errorMsg.push(this.getApplicationUpdatesErrorMsg));
    }

    let generalInfo: boolean = null;
    await req.scope.cradle.api.getGeneralInfo(slug)
      .then((value: CourtGeneralInfo) => generalInfo = value.service_centre)
      .catch((value: CourtGeneralInfo) => generalInfo = false);


    if (!applicationProgressions?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(applicationProgressions);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: ApplicationProgressionData = {
      'application_progression': applicationProgressions,
      isEnabled: generalInfo,
      errors: errors,
      updated: updated
    };

    res.render('courts/tabs/applicationProgressionContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let applicationProgressions = req.body.application_progression as ApplicationProgression[] ?? [];
    applicationProgressions.forEach(e => e.isNew = (e.isNew === true) || ((e.isNew as any) === 'true'));

    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [this.updateErrorMsg], applicationProgressions);
    }

    // Remove fully empty entries
    applicationProgressions = applicationProgressions.filter(e => !this.applicationProgressionEntryIsEmpty(e));

    const errorMsg = this.getErrorMessages(applicationProgressions);
    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, applicationProgressions);
    }

    await req.scope.cradle.api.updateApplicationUpdates(req.params.slug, applicationProgressions)
      .then((value: ApplicationProgression[]) => this.get(req, res, true, [], value))
      .catch((err: any) => this.get(req, res, false, [this.updateErrorMsg], applicationProgressions));
  }

  private addEmptyFormsForNewEntries(applicationProgressions: ApplicationProgression[], numberOfForms = 1):
    void {
    if (applicationProgressions) {
      for (let i = 0; i < numberOfForms; i++) {
        applicationProgressions.push({ type: null, type_cy: null, email: null, external_link: null,
          external_link_description: null, external_link_description_cy: null, isNew: true });
      }
    }
  }

  private applicationProgressionEntryIsEmpty(applicationProgressions: ApplicationProgression): boolean {
    return (!applicationProgressions.type && !applicationProgressions.email?.trim() &&
      !applicationProgressions.external_link?.trim() && !applicationProgressions.external_link_description?.trim());
  }

  private getErrorMessages(applicationProgressions: ApplicationProgression[]): string[] {
    const errorMsg: string[] = [];
    if (applicationProgressions.some(ot => !ot.type)) {
      // Retains the posted application progression data when errors exist
      errorMsg.push(this.emptyTypeErrorMsg);
    }

    if (applicationProgressions.some(ap => (ap.type && !ap.email && !ap.external_link &&
      !ap.external_link_description))){
      errorMsg.push(this.emptyFieldsErrorMsg);
    }

    if (applicationProgressions.some(ap => (ap.external_link && !ap.external_link_description ||
      !ap.external_link && ap.external_link_description))){
      errorMsg.push(this.linkFieldsErrorMsg);
    }

    if (applicationProgressions.some(ap => (ap.email && ap.external_link))){
      errorMsg.push(this.doubleInputErrorMsg);
    }

    // If any email used is not of an email format, return with an error
    let emailHasInvalidFormat = false;
    for (const progression of applicationProgressions){
      if (progression.email && !validateStringEmailFormat(progression.email)){
        progression.isInvalidFormat = true;
        emailHasInvalidFormat = true;
      }
    }
    if (emailHasInvalidFormat){
      errorMsg.push(this.invalidEmailFormatErrorMsg);
    }

    // If any link used is not of a url format, return with an error
    let linkHasInvalidFormat = false;
    for (const progression of applicationProgressions) {
      if (progression.external_link && !validateUrlFormat(progression.external_link)) {
        progression.isInvalidFormat = true;
        linkHasInvalidFormat = true;
      }
    }
    if (linkHasInvalidFormat) {
      errorMsg.push(this.invalidUrlFormatErrorMsg);
    }

    if (!validateDuplication(applicationProgressions, this.emailsDuplicated)) {
      errorMsg.push(this.emailDuplicatedErrorMsg);
    }
    return errorMsg;
  }

  private emailsDuplicated(applicationProgressions: ApplicationProgression[], index1: number, index2: number):
    boolean {
    return applicationProgressions[index1].email && applicationProgressions[index1].email.toLowerCase() ===
      applicationProgressions[index2].email.toLowerCase();
  }

}

