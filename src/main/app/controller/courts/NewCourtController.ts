import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';
import {NewCourt} from '../../../types/NewCourt';

@autobind
export class NewCourtController {

  addNewCourtErrorMsg = 'A problem occurred when adding the new court';
  emptyCourtNameMsg = 'A new court name value is required';
  courtNameValidationErrorMsg = 'Invalid court name: please amend and try again.';

  public async get(req: AuthedRequest,
    res: Response,
    created = false,
    nameValidationPassed = true,
    emptyCourtName = false,
    redirectUrl: string,
    nameEntered: string,
    serviceAreaChecked = false,
    errorMsg: string[] = []): Promise<void> {

    res.render('courts/addNewCourt', {
      created: created,
      nameValidationPassed: nameValidationPassed,
      emptyCourtName: emptyCourtName,
      redirectUrl: redirectUrl,
      nameEntered: nameEntered,
      serviceAreaChecked: serviceAreaChecked,
      errorMsg: errorMsg,
      csrfToken: CSRF.create()
    });
  }

  public async addNewCourt(req: AuthedRequest, res: Response): Promise<void> {
    const newCourt = {
      newCourtName: req.body.newCourtName,
      serviceCentre: req.body.serviceCentre == 'true'
    } as NewCourt;
    console.log(typeof newCourt);
    const newCourtName = newCourt.newCourtName;
    const serviceAreaChecked = newCourt.serviceCentre;

    if (newCourtName === '') {
      return this.get(req, res, false, true, true,
        '', newCourtName, serviceAreaChecked, [this.emptyCourtNameMsg]);
    }

    if (NewCourtController.checkNameForInvalidCharacters(newCourtName)) {
      return this.get(req, res, false, false, false,
        '', newCourtName, serviceAreaChecked, [this.courtNameValidationErrorMsg]);
    }

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, true, false,
        '/courts', newCourtName, serviceAreaChecked, [this.addNewCourtErrorMsg]);
    }

    const updatedSlug = newCourtName.toLowerCase()
      .replace(/[^\w\s]|_/g, '').split(' ').join('-');

    // Otherwise, add the new court

    // TODOs
    // make call to the api to add a new court
    // make sure the redirect on the javascript forwards on to the /courts/{slug}/generalinfo bit
    // unit tests etc
    // functional tests

    return this.get(req, res, true, true, false,
      '/courts/' + updatedSlug + '/edit#general', newCourtName, serviceAreaChecked, []);
  }

  private static checkNameForInvalidCharacters(name: string): boolean {
    const inValidCharacters = /[!@#$%^&*()_+=[\]{};:"\\|,.<>/?]+/;
    return inValidCharacters.test(name);
  }
}
