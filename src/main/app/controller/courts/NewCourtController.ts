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
  emptyOrInvalidValueMsg = 'One or more mandatory fields are empty or have invalid values, please check allow and try again';
  courtNameValidationErrorMsg = 'Invalid court name: please amend and try again.';

  public async get(req: AuthedRequest,
    res: Response,
    created = false,
    nameValidationPassed = true,
    emptyValueFound = false,
    invalidLonOrLat = false,
    redirectUrl: string,
    nameEntered: string,
    lonEntered: number,
    latEntered: number,
    serviceAreaChecked = false,
    errorMsg: string[] = []): Promise<void> {

    res.render('courts/addNewCourt', {
      created: created,
      nameValidationPassed: nameValidationPassed,
      emptyValueFound: emptyValueFound,
      invalidLonOrLat: invalidLonOrLat,
      redirectUrl: redirectUrl,
      nameEntered: nameEntered,
      lonEntered: lonEntered,
      latEntered: latEntered,
      serviceAreaChecked: serviceAreaChecked,
      errorMsg: errorMsg,
      csrfToken: CSRF.create()
    });
  }

  public async addNewCourt(req: AuthedRequest, res: Response): Promise<void> {
    const newCourtName = req.body.newCourtName;
    const serviceCentreChecked = req.body.serviceCentre == 'true';
    const lon = req.body.lon;
    const lat = req.body.lat;

    console.log(newCourtName);
    console.log(serviceCentreChecked);
    console.log(lon);
    console.log(lat);
    console.log(typeof lon);
    console.log(typeof lat);

    if (newCourtName === '' || lon === '' || lat === '') {
      return this.get(req, res, false, true, true, false,
        '', newCourtName, lon, lat, serviceCentreChecked, [this.emptyOrInvalidValueMsg]);
    }

    if (isNaN(lon) || isNaN(lat)) {
      return this.get(req, res, false, true, true, true,
        '', newCourtName, lon, lat, serviceCentreChecked, [this.emptyOrInvalidValueMsg]);
    }

    if (NewCourtController.isInvalidCourtName(newCourtName)) {
      return this.get(req, res, false, false, false, false,
        '', newCourtName, lon, lat, serviceCentreChecked, [this.courtNameValidationErrorMsg]);
    }

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, true, false, false,
        '/courts', newCourtName, lon, lat, serviceCentreChecked, [this.addNewCourtErrorMsg]);
    }

    // If all validation passes, add the court
    await req.scope.cradle.api.addCourt({
      new_court_name: newCourtName,
      service_centre: serviceCentreChecked,
      lon: lon,
      lat: lat
    } as NewCourt)
      .then((court: Court) => this.get(req, res, true, true, false, false,
        '/courts/' + court.slug + '/edit#general', newCourtName, lon, lat, serviceCentreChecked, []))
      .catch(async (reason: AxiosError) => {
        // Check if we have a duplicated court response (409), cater error response accordingly
        await this.get(req, res, false, true, false, false,
          '', newCourtName, lon, lat, serviceCentreChecked,
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
    return /[!@#$%^&*_+=[\]{};:"\\|,.<>/?]+/.test(name);
  }
}
