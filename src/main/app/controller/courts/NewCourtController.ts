import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';
import {NewCourt} from '../../../types/NewCourt';
import {Court} from '../../../types/Court';
import {AxiosError} from 'axios';

@autobind
export class NewCourtController {

  addNewCourtErrorMsg = 'A problem occurred when adding the new court';
  duplicateCourtErrorMsg = 'A court already exists for court provided: '
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
      new_court_name: req.body.newCourtName,
      service_centre: req.body.serviceCentre == 'true'
    } as NewCourt;
    console.log(newCourt);
    const newCourtName = newCourt.new_court_name;
    const serviceAreaChecked = newCourt.service_centre;

    if (newCourtName === '') {
      return this.get(req, res, false, true, true,
        '', newCourtName, serviceAreaChecked, [this.emptyCourtNameMsg]);
    }

    if (NewCourtController.isInvalidCourtName(newCourtName)) {
      return this.get(req, res, false, false, false,
        '', newCourtName, serviceAreaChecked, [this.courtNameValidationErrorMsg]);
    }

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, true, false,
        '/courts', newCourtName, serviceAreaChecked, [this.addNewCourtErrorMsg]);
    }

    // If all validation passes, add the court
    await req.scope.cradle.api.addCourt(newCourt)
      .then((court: Court) => this.get(req, res, true, true, false,
        '/courts/' + court.slug + '/edit#general', newCourtName, serviceAreaChecked, []))
      .catch(async (reason: AxiosError) => {
        // Check if we have a duplicated court response (409), cater error response accordingly
        await this.get(req, res, false, true, false,
          '', newCourtName, serviceAreaChecked,
          reason.response?.status === 409
            ? [this.duplicateCourtErrorMsg + newCourtName]
            : [this.addNewCourtErrorMsg]);
      });

    // TODOs
    // make sure the redirect on the javascript forwards on to the /courts/{slug}/generalinfo bit
    // unit tests etc
    // functional tests
  }

  private static isInvalidCourtName(name: string): boolean {
    return /[!@#$%^&*()_+=[\]{};:"\\|,.<>/?]+/.test(name);
  }
}
