import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {OpeningTime, OpeningTimeData} from '../../../types/OpeningTime';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';
import {OpeningType} from '../../../types/OpeningType';
import {CSRF} from '../../../modules/csrf';
import {Error} from '../../../types/Error';
import {validateDuplication} from '../../../utils/validation';
import {AxiosError} from 'axios';

@autobind
export class OpeningTimesController {

  emptyDescriptionErrorMsg = 'Description is required for Opening Hours ';
  emptyHoursErrorMsg = 'Hours are required for Opening Hours ';
  openingTimeDuplicatedErrorMsg = 'All descriptions must be unique.';
  getOpeningTimesErrorMsg = 'A problem occurred when retrieving the opening times.';
  getOpeningTypesErrorMsg = 'A problem occurred when retrieving the opening time descriptions.';
  updateErrorMsg = 'A problem occurred when saving the opening times.';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';
  /**
   * GET /courts/:slug/opening-times
   * render the view with data from database for opening times tab
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsg: Error[] = [],
    openingTimes: OpeningTime[] = null): Promise<void> {
    let fatalError = false;
    const slug: string = req.params.slug;

    if (!openingTimes) {
      // Get opening times from API and set the isNew property to false on each if API call successful.
      await req.scope.cradle.api.getOpeningTimes(slug)
        .then((value: OpeningTime[]) => openingTimes = value.map(ot => {
          ot.isNew = false;
          return ot;
        }))
        .catch(() => {
          errorMsg.push({text:this.getOpeningTimesErrorMsg});
          fatalError = true;
        });
    }

    let types: OpeningType[] = [];
    await req.scope.cradle.api.getOpeningTimeTypes()
      .then((value: OpeningType[]) => types = value)
      .catch(() => {
        errorMsg.push({text:this.getOpeningTypesErrorMsg});
        fatalError = true;
      });

    if (!openingTimes?.some(ot => ot.isNew === true)) {
      this.addEmptyFormsForNewEntries(openingTimes);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg.text, href: msg.href});
    }

    const pageData: OpeningTimeData = {
      'opening_times': openingTimes,
      openingTimeTypes: OpeningTimesController.getOpeningTimeTypesForSelect(types),
      errors: errors,
      updated: updated,
      fatalError: fatalError
    };

    res.render('courts/tabs/openingHoursContent', pageData);
  }
  /**
   * PUT /courts/:slug/opening-times
   * validate input data and update the opening times and re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let openingTimes = req.body.opening_times as OpeningTime[] ?? [];
    openingTimes.forEach(ot => ot.isNew = (ot.isNew === true) || ((ot.isNew as any) === 'true'));

    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [{text:this.updateErrorMsg}], openingTimes);
    }

    // Remove fully empty entries
    openingTimes = openingTimes.filter(ot => !this.openingHoursEntryIsEmpty(ot));
    const errorMsg: Error[] = [];

    openingTimes.forEach((ot, index) => {

      index = index + 1;
      if (!ot.type_id)
      {
        errorMsg.push({text: (this.emptyDescriptionErrorMsg +index+'.') , href: '#description-'+ index});
      }
      else if (ot.hours === '')
      {
        errorMsg.push({text: (this.emptyHoursErrorMsg +index+'.') , href: '#hours-'+ index });
      }
    });

    if (!validateDuplication(openingTimes, this.openingHoursDuplicated)) {
      errorMsg.push({text:this.openingTimeDuplicatedErrorMsg});
    }

    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, openingTimes);
    }

    await req.scope.cradle.api.updateOpeningTimes(req.params.slug, openingTimes)
      .then((value: OpeningTime[]) => this.get(req, res, true, [], value))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.updateErrorMsg;
        await this.get(req, res, false, [{text:error}], openingTimes);
      });
  }
  /**
   * map the OpeningType model to select item.
   */
  private static getOpeningTimeTypesForSelect(standardTypes: OpeningType[]): SelectItem[] {
    return standardTypes.map((ott: OpeningType) => (
      {value: ott.id, text: ott.type, selected: false}));
  }
  /**
   * adds an empty form so the view is rendered with one blank form
   */
  private addEmptyFormsForNewEntries(openingHours: OpeningTime[], numberOfForms = 1): void {
    if (openingHours) {
      for (let i = 0; i < numberOfForms; i++) {
        openingHours.push({'type_id': null, hours: null, isNew: true});
      }
    }
  }
  /**
   * check if opening hour entry is empty
   */
  private openingHoursEntryIsEmpty(openingHours: OpeningTime): boolean {
    return (!openingHours.type_id && !openingHours.hours?.trim());
  }
  /**
   * check if opening hour is duplicated
   */
  private openingHoursDuplicated(openingHours: OpeningTime[], index1: number, index2: number): boolean {
    return openingHours[index1].type_id && openingHours[index1].type_id === openingHours[index2].type_id;
  }
}
