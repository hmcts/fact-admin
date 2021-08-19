import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';
import autobind from 'autobind-decorator';
import {Facility, FacilityPageData, FacilityType} from '../../../types/Facility';
import {SelectItem} from '../../../types/CourtPageData';
import {validateDuplication} from '../../../utils/validation';
import {Error} from '../../../types/Error';

@autobind
export class CourtFacilitiesController {

  emptyNameOrDescriptionErrorMsg = 'Name and description are required for all court facilities.';
  facilityDuplicatedErrorMsg = 'All facilities must be unique.';
  getFacilityTypesErrorMsg = 'A problem occurred when retrieving the list of facility types.';
  getCourtFacilitiesErrorMsg = 'A problem occurred when retrieving the court facilities.';
  updateErrorMsg = 'A problem occurred when saving the court facilities.';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsg: string[] = [],
    courtFacilities: Facility[] = null,
    requiresValidation = true): Promise<void> {
    if (!courtFacilities) {
      const slug: string = req.params.slug as string;
      await req.scope.cradle.api.getCourtFacilities(slug)
        .then((value: Facility[]) => courtFacilities = value)
        .catch(() => errorMsg.push(this.getCourtFacilitiesErrorMsg));
    }

    let allFacilitiesTypes: FacilityType[] = [];

    await req.scope.cradle.api.getAllFacilityTypes()
      .then((value: FacilityType[]) => allFacilitiesTypes = value)
      .catch(() => errorMsg.push(this.getFacilityTypesErrorMsg));

    if (!courtFacilities?.some(ot => ot.isNew === true)) {
      this.addEmptyFormsForNewEntries(courtFacilities);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: FacilityPageData = {
      errors: errors,
      updated: updated,
      facilitiesTypes: CourtFacilitiesController.getFacilityTypesForSelect(allFacilitiesTypes),
      courtFacilities: courtFacilities,
      requiresValidation: requiresValidation
    };

    res.render('courts/tabs/facilitiesContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let courtFacilities = req.body.courtFacilities as Facility[] ?? [];
    courtFacilities.forEach(ot => {
      ot.isNew = (ot.isNew === true) || ((ot.isNew as any) === 'true');
      // Workaround for the issue where the the empty row is removed after the previous name selection.
      if (!ot.name) {
        ot.name = '';
      }
    });

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [this.updateErrorMsg], courtFacilities);
    }

    // Remove fully empty entries
    courtFacilities = courtFacilities.filter(cf => !this.facilityEntryIsEmpty(cf));
    const errorMsg: string[] = [];

    if (courtFacilities.some(cf => cf.name === '' || cf.description === '')) {
      errorMsg.push(this.emptyNameOrDescriptionErrorMsg);
    }

    if (!validateDuplication(courtFacilities, this.facilityDuplicated)) {
      errorMsg.push(this.facilityDuplicatedErrorMsg);
    }

    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, courtFacilities);
    }

    await req.scope.cradle.api.updateCourtFacilities(req.params.slug, courtFacilities)
      .then((value: Facility[]) => this.get(req, res, true, [], value))
      .catch(() => this.get(req, res, false, [this.updateErrorMsg], courtFacilities));
  }

  public async addRow(req: AuthedRequest, res: Response): Promise<void> {
    const courtFacilities = req.body.courtFacilities as Facility[] ?? [];
    courtFacilities.forEach(ot => ot.isNew = (ot.isNew === true) || ((ot.isNew as any) === 'true'));
    this.addEmptyFormsForNewEntries(courtFacilities);
    await this.get(req, res, false, [], courtFacilities, false);
  }

  private static getFacilityTypesForSelect(standardTypes: FacilityType[]): SelectItem[] {
    return standardTypes.map((ft: FacilityType) => (
      {value: ft.name, text: ft.name, selected: false}));
  }

  private addEmptyFormsForNewEntries(courFacilities: Facility[], numberOfForms = 1): void {
    if (courFacilities) {
      for (let i = 0; i < numberOfForms; i++) {
        courFacilities.push({name:null,description: null, descriptionCy: null, isNew: true});
      }
    }
  }

  private facilityEntryIsEmpty(courtFacility: Facility): boolean {
    return (!courtFacility.name && !courtFacility.description && !courtFacility.descriptionCy?.trim());
  }

  private facilityDuplicated(courFacilities: Facility[], index1: number, index2: number): boolean {
    return courFacilities[index1].name
      && courFacilities[index2].name
      // Make sure we don't have duplicated mutually exclusive (e.g. 'parking' vs. 'No parking') facility types
      && (courFacilities[index1].name.toLowerCase().indexOf(courFacilities[index2].name.toLowerCase()) != -1
        || courFacilities[index2].name.toLowerCase().indexOf(courFacilities[index1].name.toLowerCase()) != -1);
  }
}
