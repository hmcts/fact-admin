import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtGeneralInfo, CourtGeneralInfoData} from '../../../types/CourtGeneralInfo';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {CourtGeneralInfoRedirect} from '../../../types/CourtGeneralInfoRedirect';

@autobind
export class GeneralInfoController {

  updateGeneralInfoErrorMsg = 'A problem occurred when saving the general information.';
  getGeneralInfoErrorMsg = 'A problem occurred when retrieving the general information.';
  updateDuplicateGeneralInfoErrorMsg = 'All names must be unique. Court already exists with name: ';
  duplicateNameErrorMsg = 'Duplicated name';
  blankNameErrorMsg = 'Name is required';
  specialCharacterErrorMsg = 'Valid characters are: A-Z, a-z, 0-9, \' and -';
  updateAlertErrorMsg = 'Urgent notices are limited to 250 characters including spaces.';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    nameFieldErrorMsg = '',
    generalInfo: CourtGeneralInfo = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!generalInfo) {
      await req.scope.cradle.api.getGeneralInfo(slug)
        .then((value: CourtGeneralInfo) => generalInfo = value)
        .catch(() => error += this.getGeneralInfoErrorMsg);
    }

    const pageData: CourtGeneralInfoData = {
      generalInfo: generalInfo,
      errorMsg: error,
      updated: updated,
      nameFieldError: nameFieldErrorMsg
    };

    res.render('courts/tabs/generalContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const generalInfo = req.body as CourtGeneralInfo;
    const slug: string = req.params.slug as string;
    const updatedSlug = generalInfo.name
      ? generalInfo.name.toLowerCase().replace(/[^\w\s-]|_/g, '').split(' ').join('-')
      : slug;

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, '', generalInfo);
    }

    if (req.session.user.isSuperAdmin === true && generalInfo.name.trim() === '') {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, this.blankNameErrorMsg, generalInfo);
    }

    if (this.checkNameForInvalidCharacters(generalInfo.name)) {
      return this.get(req, res, false, this.updateGeneralInfoErrorMsg, this.specialCharacterErrorMsg, generalInfo);
    }

    if (generalInfo.alert.length > 300 || generalInfo.alert_cy.length > 300) {
      return this.get(req, res, false, this.updateAlertErrorMsg, '', generalInfo);
    }

    generalInfo.open = generalInfo.open ?? false;
    generalInfo['access_scheme'] = generalInfo['access_scheme'] ?? false;

    console.log(req.body);

    await req.scope.cradle.api.updateGeneralInfo(slug, generalInfo)
      .then((value: CourtGeneralInfo) => {
        if (updatedSlug === slug) {
          this.get(req, res, true, '', '', value);
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

  public renderRedirect(res: Response, redirectURL: string): void {
    const pageData: CourtGeneralInfoRedirect = {
      redirectURL: redirectURL
    };
    res.render('courts/tabs/generalRedirect', pageData);
  }

  private checkNameForInvalidCharacters(name: string): boolean {
    const inValidCharacters = /[!@#$%^&*_+=[\]{};:"\\|,.<>/?]+/;
    return inValidCharacters.test(name);
  }
}
