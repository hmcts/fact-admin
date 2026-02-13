import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';
import {NewCourt} from '../../../types/NewCourt';
import {Court} from '../../../types/Court';
import {AxiosError} from 'axios';
import {ServiceArea} from '../../../types/ServiceArea';
import {newCourtErrorMessage} from '../../../enums/newCourtErrorMessage';

@autobind
export class NewCourtController {

  // Form Error JSON

  formErrors = {
    nameError: {
      text: null as string
    },
    latitudeError: {
      text: null as string
    },
    longitudeError: {
      text: null as string
    },
    serviceAreaError: {
      text: null as string
    },
    addCourtError: {
      text: null as string
    }
  };
  /**
   * GET /courts/add-court
   * render the view with data from database for new court tab
   */
  public async get(req: AuthedRequest,
    res: Response,
    created = false,
    redirectUrl = '',
    nameEntered = '',
    lonEntered = 0,
    latEntered = 0,
    serviceAreaChecked = false,
    serviceAreas: ServiceArea[] = [],
    formErrors: {} = null): Promise<void> {

    let fatalError = false;
    const allServiceAreas = await req.scope.cradle.api.getAllServiceAreas()
      .catch(() => {
        this.formErrors.addCourtError.text = newCourtErrorMessage.getServiceAreas;
        fatalError = true;
      });

    res.render('courts/addNewCourt', {
      created: created,
      activeAddNewCourtPage: true,
      redirectUrl: redirectUrl,
      nameEntered: nameEntered,
      lonEntered: lonEntered,
      latEntered: latEntered,
      serviceAreaChecked: serviceAreaChecked,
      serviceAreas: serviceAreas,
      allServiceAreas: allServiceAreas,
      csrfToken: CSRF.create(),
      fatalError: fatalError,
      formErrors: this.formErrors.addCourtError.text || this.formErrors.nameError.text
        ? this.formErrors : formErrors //if problem adding court or duplicate name show errors
    });
  }
  /**
   * POST /courts/add-court
   * validate input data and add new court then re-render the view
   */
  public async addNewCourt(req: AuthedRequest, res: Response): Promise<void> {
    this.formErrors.addCourtError.text = null;
    this.formErrors.nameError.text = null;
    this.formErrors.latitudeError.text = null;
    this.formErrors.serviceAreaError.text = null;
    this.formErrors.longitudeError.text = null;

    const newCourtName = req.body.newCourtName;
    const serviceCentreChecked = req.body.serviceCentre == 'true';
    const lon = req.body.lon;
    const lat = req.body.lat;
    const serviceAreas = serviceCentreChecked ? (Array.isArray(req.body.serviceAreaItems)
      ? req.body.serviceAreaItems as ServiceArea[] ?? []
      : (!req.body.serviceAreaItems ? [] : Array(req.body.serviceAreaItems))) : [];
    let validForm = false;

    validForm = this.isValidForm(newCourtName, lon, lat, serviceCentreChecked, serviceAreas);

    if(!validForm) {
      return this.get(req, res, false,
        '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas, this.formErrors);
    }

    if(!CSRF.verify(req.body._csrf)) {
      this.formErrors.addCourtError.text = newCourtErrorMessage.addNewCourt;
      return this.get(req, res, false,
        '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas, this.formErrors);
    }

    // If all validation passes, add the court
    await req.scope.cradle.api.addCourt({
      'new_court_name': newCourtName,
      'service_centre': serviceCentreChecked,
      lon: lon,
      lat: lat,
      'service_areas': serviceAreas
    } as NewCourt)
      .then((court: Court) => this.get(req, res, true,
        '/courts/' + court.slug + '/edit#general', newCourtName, lon, lat, serviceCentreChecked, serviceAreas))
      .catch(async (reason: AxiosError) => {
        // Check if we have a duplicated court response (409), cater error response accordingly
        if(reason.response?.status === 409) {
          this.formErrors.nameError.text = newCourtErrorMessage.duplicateCourt + newCourtName;
        }
        else {
          this.formErrors.addCourtError.text = newCourtErrorMessage.addNewCourt;
        }
        await this.get(req, res, false,
          '', newCourtName, lon, lat, serviceCentreChecked, serviceAreas, null);
      });
  }
  /**
   * check if court name is valid
   */
  private static isInvalidCourtName(name: string): boolean {
    return /[!@#$%^&*_+=[\]{};:"\\|.<>/?]+/.test(name);
  }

  /**
   * check if form inputs are valid
   */
  private isValidForm(newCourtName: any, lon: any, lat: any, serviceCentreChecked: boolean, serviceAreas: any[]) {
    let validForm = true;

    if (!newCourtName || newCourtName.trim().length === 0) {
      this.formErrors.nameError.text = newCourtErrorMessage.nameEmpty;
      validForm = false;
    }

    if (NewCourtController.isInvalidCourtName(newCourtName)) {
      this.formErrors.nameError.text = newCourtErrorMessage.nameInvalid;
      validForm = false;
    }

    if(!lon || lon.trim().length === 0) {
      this.formErrors.longitudeError.text = newCourtErrorMessage.longitudeEmpty;
      validForm = false;
    }

    if(isNaN(lon)) {
      this.formErrors.longitudeError.text = newCourtErrorMessage.longitudeInvalid;
      validForm = false;
    }

    if(!lat || lat.trim().length === 0) {
      this.formErrors.latitudeError.text = newCourtErrorMessage.latitudeEmpty;
      validForm = false;
    }

    if(isNaN(lat)) {
      this.formErrors.latitudeError.text = newCourtErrorMessage.latitudeInvalid;
      validForm = false;
    }

    if(serviceCentreChecked && !serviceAreas.length) {
      this.formErrors.serviceAreaError.text = newCourtErrorMessage.serviceAreaNotSelected;
      validForm = false;
    }
    return validForm;
  }
}
