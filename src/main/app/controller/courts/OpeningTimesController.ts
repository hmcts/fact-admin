import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {OpeningTime, OpeningTimeData} from '../../../types/OpeningTime';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';
import {OpeningType} from '../../../types/OpeningType';
import {CSRF} from '../../../modules/csrf';
import {validateDuplication} from '../../../utils/validation';
import {Error} from '../../../types/Error';

@autobind
export class OpeningTimesController {

  emptyTypeOrHoursErrorMsg = 'Description and hours are required for all opening times.';
  openingTimeDuplicatedErrorMsg = 'All descriptions must be unique.';
  getOpeningTimesErrorMsg = 'A problem occurred when retrieving the opening times.';
  getOpeningTypesErrorMsg = 'A problem occurred when retrieving the opening time descriptions.';
  updateErrorMsg = 'A problem occurred when saving the opening times.';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsg: string[] = [],
    openingTimes: OpeningTime[] = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!openingTimes) {
      // Get opening times from API and set the isNew property to false on each if API call successful.
      await req.scope.cradle.api.getOpeningTimes(slug)
        .then((value: OpeningTime[]) => openingTimes = value.map(ot => { ot.isNew = false; return ot; }))
        .catch(() => errorMsg.push(this.getOpeningTimesErrorMsg));
    }

    let types: OpeningType[] = [];
    await req.scope.cradle.api.getOpeningTimeTypes()
      .then((value: OpeningType[]) => types = value)
      .catch(() => errorMsg.push(this.getOpeningTypesErrorMsg));

    if (!openingTimes?.some(ot => ot.isNew === true)) {
      this.addEmptyFormsForNewEntries(openingTimes);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: OpeningTimeData = {
      'opening_times': openingTimes,
      openingTimeTypes: OpeningTimesController.getOpeningTimeTypesForSelect(types),
      errors: errors,
      updated: updated
    };

    res.render('courts/tabs/openingHoursContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let openingTimes = req.body.opening_times as OpeningTime[] ?? [];
    openingTimes.forEach(ot => ot.isNew = (ot.isNew === true) || ((ot.isNew as any) === 'true'));

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [this.updateErrorMsg], openingTimes);
    }

    // Remove fully empty entries
    openingTimes = openingTimes.filter(ot => !this.openingHoursEntryIsEmpty(ot));
    const errorMsg: string[] = [];

    if (openingTimes.some(ot => !ot.type_id || ot.hours === '')) {
      errorMsg.push(this.emptyTypeOrHoursErrorMsg);
    }

    if (!validateDuplication(openingTimes, this.openingHoursDuplicated)) {
      errorMsg.push(this.openingTimeDuplicatedErrorMsg);
    }

    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, openingTimes);
    }

    await req.scope.cradle.api.updateOpeningTimes(req.params.slug, openingTimes)
      .then((value: OpeningTime[]) => this.get(req, res, true, [], value))
      .catch(() => this.get(req, res, false, [this.updateErrorMsg], openingTimes));
  }

  private static getOpeningTimeTypesForSelect(standardTypes: OpeningType[]): SelectItem[] {
    return standardTypes.map((ott: OpeningType) => (
      {value: ott.id, text: ott.type, selected: false}));
  }

  private addEmptyFormsForNewEntries(openingHours: OpeningTime[], numberOfForms = 1): void {
    if (openingHours) {
      for (let i = 0; i < numberOfForms; i++) {
        openingHours.push({'type_id': null, hours: null, isNew: true});
      }
    }
  }

  private openingHoursEntryIsEmpty(openingHours: OpeningTime): boolean {
    return (!openingHours.type_id && !openingHours.hours?.trim());
  }

  private openingHoursDuplicated(openingHours: OpeningTime[], index1: number, index2: number): boolean {
    return openingHours[index1].type_id && openingHours[index1].type_id === openingHours[index2].type_id;
  }
}
