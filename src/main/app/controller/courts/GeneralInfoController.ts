import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtGeneralInfo, CourtGeneralInfoData} from '../../../types/CourtGeneralInfo';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {CourtGeneralInfoRedirect} from '../../../types/CourtGeneralInfoRedirect';
import {replaceMultipleSpaces} from '../../../utils/validation';

@autobind
export class GeneralInfoController {

  updateGeneralInfoErrorMsg = 'A problem occurred when saving the general information.';
  getGeneralInfoErrorMsg = 'A problem occurred when retrieving the general information.';
  updateDuplicateGeneralInfoErrorMsg = 'All names must be unique. Please check that a user is currently not '
    + 'editing this court, and that a court does not already exists with name: ';
  duplicateNameErrorMsg = 'Duplicated name';
  blankNameErrorMsg = 'Name is required';
  specialCharacterErrorMsg = 'Valid characters are: A-Z, a-z, 0-9, \' and -';
  updateAlertErrorMsg = 'Urgent notices are limited to 250 characters including spaces.';
  updateIntroParagraphErrorMsg = 'Intro paragraphs for service centres are limited to 400 characters including spaces.';
  /**
   * GET /courts/:slug/general-info
   * render the view with data from database for court general tab
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    nameFieldErrorMsg = '',
    generalInfo: CourtGeneralInfo = null): Promise<void> {

    const slug: string = req.params.slug;
    let fatalError = false;

    if (!generalInfo) {
      await req.scope.cradle.api.getGeneralInfo(slug)
        .then((value: CourtGeneralInfo) => generalInfo = value)
        .catch(() => {error += this.getGeneralInfoErrorMsg; fatalError = true;});
    }

    const pageData: CourtGeneralInfoData = {
      generalInfo: generalInfo,
      errorMsg: error,
      updated: updated,
      nameFieldError: nameFieldErrorMsg,
      fatalError: fatalError
    };

    res.render('courts/tabs/generalContent', pageData);
  }
  /**
   * PUT /courts/:slug/general-info
   * validate input data and update court general data then re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const generalInfo = req.body as CourtGeneralInfo;
    const slug: string = req.params.slug;
    const updatedSlug = generalInfo.name
      ? generalInfo.name.toLowerCase().replace(/[^\w\s-]|_/g, '').split(' ').join('-')
      : slug;

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, '', generalInfo);
    }

    if (req.appSession.user.isSuperAdmin === true && generalInfo.name.trim() === '') {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, this.blankNameErrorMsg, generalInfo);
    }

    if (this.checkNameForInvalidCharacters(generalInfo.name)) {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, this.specialCharacterErrorMsg, generalInfo);
    }

    replaceMultipleSpaces(generalInfo);

    if (generalInfo.alert.length > 400 || generalInfo.alert_cy.length > 400) {
      return this.get(req, res, false, this.updateAlertErrorMsg, '', generalInfo);
    }

    if (((/true/i).test(String(generalInfo.service_centre))) // JavaScript sends boolean as a string...
      && (generalInfo.sc_intro_paragraph.length > 650 || generalInfo.sc_intro_paragraph_cy.length > 650)) {
      return this.get(req, res, false, this.updateIntroParagraphErrorMsg, '', generalInfo);
    }

    generalInfo.open = generalInfo.open ?? false;
    generalInfo['access_scheme'] = generalInfo['access_scheme'] ?? false;
    generalInfo['common_platform'] = generalInfo['common_platform'] ?? false;

    await req.scope.cradle.api.updateGeneralInfo(slug, generalInfo)
      .then(async (value: CourtGeneralInfo) => {
        if (updatedSlug === slug) {
          await this.get(req, res, true, '', '', value);
        } else {
          this.renderRedirect(res, '/courts/' + updatedSlug + '/edit#general');
        }
      })
      .catch(async (reason: AxiosError) => {
        const nameFieldErrorMsg = reason.response?.status === 409 ? this.duplicateNameErrorMsg : '';
        const error = reason.response?.status === 409
          ? this.updateDuplicateGeneralInfoErrorMsg + generalInfo.name
          : this.updateGeneralInfoErrorMsg;
        await this.get(req, res, false, error, nameFieldErrorMsg, generalInfo);
      });
  }
  /**
   * GET /courts/:slug/general-info
   * once data is successfully validated view is redirected for confirmation of changes
   */
  public renderRedirect(res: Response, redirectURL: string): void {
    const pageData: CourtGeneralInfoRedirect = {
      redirectURL: redirectURL
    };
    res.render('courts/tabs/generalRedirect', pageData);
  }

  private checkNameForInvalidCharacters(name: string): boolean {
    const inValidCharacters = /[!@#$%^&*_+=[\]{};:"\\|.<>/?]+/;
    return inValidCharacters.test(name);
  }
}
