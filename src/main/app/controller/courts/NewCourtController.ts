import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';
import {NewCourt} from '../../../types/NewCourt';
import {Court} from '../../../types/Court';
import {AxiosError} from 'axios';
import {ServiceArea} from '../../../types/ServiceArea';

@autobind
export class NewCourtController {

  getServiceAreasErrorMsg = 'A problem occurred when retrieving the service areas. ';
  addNewCourtErrorMsg = 'A problem occurred when adding the new court';
  duplicateCourtErrorMsg = 'A court already exists for court provided: ';
  emptyOrInvalidValueMsg = 'One or more mandatory fields are empty or have invalid values, please check allow and try again. '
    + 'If you are adding a service centre, make sure to ensure at least one service area is selected. ';
  courtNameValidationErrorMsg = 'Invalid court name: please amend and try again.';
  /**
   * GET /courts/add-court
   * render the view with data from database for new court tab
   */
  public async get(req: AuthedRequest,
    res: Response,
    created = false,
    nameValidationPassed = true,
    emptyValueFound = false,
    invalidLonOrLat = false,
    redirectUrl = '',
    nameEntered = '',
    lonEntered = 0,
    latEntered = 0,
    serviceAreaChecked = false,
    serviceAreas: ServiceArea[] = [],
    errorMsg: string[] = []): Promise<void> {

    let fatalError = false;
    const allServiceAreas = await req.scope.cradle.api.getAllServiceAreas()
      .catch(() => {
        errorMsg.push(this.getServiceAreasErrorMsg);
        fatalError = true;
      });


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
      serviceAreas: serviceAreas,
      allServiceAreas: allServiceAreas,
      errorMsg: errorMsg,
      csrfToken: CSRF.create(),
      fatalError: fatalError,
    });
  }
  /**
   * POST /courts/add-court
   * validate input data and add new court then re-render the view
   */
  public async addNewCourt(req: AuthedRequest, res: Response): Promise<void> {
    const newCourtName = req.body.newCourtName;
    const serviceCentreChecked = req.body.serviceCentre == 'true';
    const lon = req.body.lon;
    const lat = req.body.lat;
    const serviceAreas = serviceCentreChecked ? (Array.isArray(req.body.serviceAreaItems)
      ? req.body.serviceAreaItems as ServiceArea[] ?? []
      : (!req.body.serviceAreaItems ? [] : Array(req.body.serviceAreaItems))) : [];

    if (newCourtName === '' || lon === '' || lat === '') {
      return this.get(req, res, false, true, true, false,
        '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas,[this.emptyOrInvalidValueMsg]);
    }

    if (serviceCentreChecked && !serviceAreas.length) {
      return this.get(req, res, false, true, true, false,
        '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas, [this.emptyOrInvalidValueMsg]);
    }

    if (isNaN(lon) || isNaN(lat)) {
      return this.get(req, res, false, true, true, true,
        '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas, [this.emptyOrInvalidValueMsg]);
    }

    if (NewCourtController.isInvalidCourtName(newCourtName)) {
      return this.get(req, res, false, false, false, false,
        '', newCourtName, lon, lat, serviceCentreChecked,serviceAreas, [this.courtNameValidationErrorMsg]);
    }

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, true, false, false,
        '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas, [this.addNewCourtErrorMsg]);
    }

    // If all validation passes, add the court
    await req.scope.cradle.api.addCourt({
      'new_court_name': newCourtName,
      'service_centre': serviceCentreChecked,
      lon: lon,
      lat: lat,
      'service_areas': serviceAreas
    } as NewCourt)
      .then((court: Court) => this.get(req, res, true, true, false, false,
        '/courts/' + court.slug + '/edit#general', newCourtName, lon, lat, serviceCentreChecked, serviceAreas))
      .catch(async (reason: AxiosError) => {
        // Check if we have a duplicated court response (409), cater error response accordingly
        await this.get(req, res, false, true, false, false,
          '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas, reason.response?.status === 409
            ? [this.duplicateCourtErrorMsg + newCourtName]
            : [this.addNewCourtErrorMsg]);
      });
  }
  /**
   * check if court name is valid
   */
  private static isInvalidCourtName(name: string): boolean {
    return /[!@#$%^&*_+=[\]{};:"\\|.<>/?]+/.test(name);
  }
}
