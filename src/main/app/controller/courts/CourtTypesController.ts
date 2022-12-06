import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtType, CourtTypeItem, CourtTypePageData} from '../../../types/CourtType';
import {CSRF} from '../../../modules/csrf';
import {CourtTypesAndCodes} from '../../../types/CourtTypesAndCodes';
import {DxCode} from '../../../types/DxCode';
import {validateDuplication} from '../../../utils/validation';

export enum courtType {
  magistrate = "Magistrates' Court",
  county = 'County Court',
  crown = 'Crown Court',
  family = 'Family Court',
  tribunal = 'Tribunal'
}

@autobind
export class CourtTypesController {

  emptyCourtCodeErrorMsg = 'Court code is required and must be numeric and start with 1-9';
  emptyDxCodeErrorMsg = 'Code is required for all Dx code entries.';
  duplicatedDxCodeErrorMsg = 'All dx codes must be unique.';
  getCourtTypesAndCodesErrorMsg = 'A problem occurred when retrieving the list of court types and codes.';
  getCourtTypesErrorMsg = 'A problem occurred when retrieving the list of court types.';
  updateErrorMsg = 'A problem occurred when saving the court types.';
  emptyCourtTypesErrorMsg = 'One or more court types are required for types entries.';


  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    courtTypesAndCodes: CourtTypesAndCodes = null ): Promise<void> {
    const slug: string = req.params.slug;
    let fatalError = false;
    if (courtTypesAndCodes == null) {
      await req.scope.cradle.api.getCourtTypesAndCodes(slug)
        .then((value: CourtTypesAndCodes) => courtTypesAndCodes = value)
        .catch(() => {error += this.getCourtTypesAndCodesErrorMsg; fatalError = true;});
    }
    let courtTypes: CourtType[] = [];

    if(courtTypesAndCodes) {
      if (!courtTypesAndCodes.dxCodes?.some(ot => ot.isNew === true)) {
        this.addEmptyFormsForNewEntries(courtTypesAndCodes.dxCodes);
      }

      await req.scope.cradle.api.getCourtTypes(slug)
        .then((value: CourtType[]) => courtTypes = value)
        .catch(() => {error += this.getCourtTypesErrorMsg; fatalError = true;});
    }



    const pageData: CourtTypePageData = {
      errorMsg: error,
      updated: updated,
      courtTypes: courtTypesAndCodes && courtTypesAndCodes.types ? this.mapCourtTypeToCourtTypeItem(courtTypes, courtTypesAndCodes.types) : this.mapCourtTypeToCourtTypeItem(courtTypes, []),
      gbs: courtTypesAndCodes ? courtTypesAndCodes.gbsCode : null,
      dxCodes: courtTypesAndCodes ? courtTypesAndCodes.dxCodes : [],
      fatalError: fatalError
    };

    res.render('courts/tabs/typesContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {

    let courtTypesAndCodes: CourtTypesAndCodes = null;

    courtTypesAndCodes = {types: req.body.types, gbsCode: req.body.gbsCode ? req.body.gbsCode.trim() : req.body.gbsCode, dxCodes: req.body.dxCodes ? req.body.dxCodes : []};

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, this.updateErrorMsg, null);
    }

    if (req.body.types) {

      courtTypesAndCodes.types = this.mapBodyToCourtType(req);

      if(courtTypesAndCodes.types.find(c =>
        (c.name === courtType.magistrate && this.CheckCodeIsNullOrNan(c.code))||
        (c.name === courtType.county && this.CheckCodeIsNullOrNan(c.code))||
        (c.name === courtType.family && this.CheckCodeIsNullOrNan(c.code))||
        (c.name === courtType.tribunal && this.CheckCodeIsNullOrNan(c.code))||
        (c.name === courtType.crown && this.CheckCodeIsNullOrNan(c.code)) )) {
        return this.get(req, res, false, this.emptyCourtCodeErrorMsg, courtTypesAndCodes);
      }

      // Remove fully empty entries
      courtTypesAndCodes.dxCodes = courtTypesAndCodes.dxCodes.filter(dx => !this.dxCodeEntryIsEmpty(dx));

      if (courtTypesAndCodes.dxCodes.some(dx => dx.code === '')) {
        return this.get(req, res, false, this.emptyDxCodeErrorMsg, courtTypesAndCodes);
      }

      if (!validateDuplication(courtTypesAndCodes.dxCodes, this.dxCodesDuplicated)) {
        return this.get(req, res, false, this.duplicatedDxCodeErrorMsg, courtTypesAndCodes);
      }

      else
      {
        await req.scope.cradle.api.updateCourtTypesAndCodes(req.params.slug, courtTypesAndCodes)
          .then(() => this.get(req, res, true, '', courtTypesAndCodes))
          .catch(() => this.get(req, res, false, this.updateErrorMsg, courtTypesAndCodes));
      }
    }
    else
    {
      return this.get(req, res, false, this.emptyCourtTypesErrorMsg, courtTypesAndCodes);
    }

  }

  private mapCourtTypeToCourtTypeItem(allCourtTypes: CourtType[], courtCourtTypes: CourtType[]): CourtTypeItem[] {

    if( courtCourtTypes && allCourtTypes) {
      const courtTypeItems = allCourtTypes.map((ct: CourtType) => (
        {
          value: JSON.stringify(ct),
          text: ct.name,
          magistrate: ct.name === courtType.magistrate ? true: false,
          county: ct.name === courtType.county ? true: false,
          crown: ct.name === courtType.crown? true: false,
          family: ct.name === courtType.family? true: false,
          tribunal: ct.name === courtType.tribunal? true: false,
          checked: this.isChecked(ct, courtCourtTypes),
          code: this.getCode(ct.id, courtCourtTypes)
        }));

      return courtTypeItems;
    }
    else
      return [];
  }

  private mapBodyToCourtType(req: AuthedRequest): CourtType[] {

    const courtTypes: CourtType[] = Array.isArray(req.body.types) ? req.body.types.map((ct: string) => JSON.parse(ct)) : [JSON.parse(req.body.types)];

    const courtTypeItems = courtTypes.map((ct) => (
      {
        id: ct.id,
        name:ct.name,
        code: this.setCode(
          ct.name,
          req.body.magistratesCourtCode,
          req.body.familyCourtCode,
          req.body.locationCourtCode,
          req.body.countyCourtCode,
          req.body.crownCourtCode
        ),
      }));

    return courtTypeItems;
  }


  private isChecked(courtType: CourtType, courtCourtTypes: CourtType[]) {
    return (courtCourtTypes.some(e => e.id === courtType.id));
  }


  private getCode(id: number, courtCourtTypes: CourtType[]) {

    return (courtCourtTypes.find(e => e.id === id) ? courtCourtTypes.find(e => e.id === id).code : null);

  }

  private setCode(
    name: string,
    magistratesCourtCode: string,
    familyCourtCode: string,
    locationCourtCode: string,
    countyCourtCode: string,
    crownCourtCode: string
  ){

    switch (name) {
      case courtType.magistrate:
        return this.ValidateCode(magistratesCourtCode);

      case courtType.family:
        return this.ValidateCode(familyCourtCode);

      case courtType.tribunal:
        return this.ValidateCode(locationCourtCode);

      case courtType.county:
        return this.ValidateCode(countyCourtCode);

      case courtType.crown:
        return this.ValidateCode(crownCourtCode);

      default:
        return null;
    }
  }

  private ValidateCode(code: string)
  {
    const regExp = /^[1-9]\d{0,8}$/;
    return regExp.test(code) ? parseInt(code) : null ;

  }

  private CheckCodeIsNullOrNan(code: number){

    return !code || isNaN(code);
  }

  private dxCodesDuplicated(dxCodes: DxCode[], index1: number, index2: number): boolean {
    return dxCodes[index1].code.toLowerCase() === dxCodes[index2].code.toLowerCase();
  }

  private dxCodeEntryIsEmpty(dxCode: DxCode): boolean {
    return (!dxCode.code?.trim() && !dxCode.explanation?.trim() && !dxCode.explanationCy?.trim());
  }

  private addEmptyFormsForNewEntries(dxCodes: DxCode[], numberOfForms = 1): void {
    if (dxCodes) {
      for (let i = 0; i < numberOfForms; i++) {
        dxCodes.push({code: null, explanation: null, explanationCy: null, isNew: true});
      }
    }
  }
}
