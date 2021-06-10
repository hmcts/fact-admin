import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtType, CourtTypeItem, CourtTypePageData} from '../../../types/CourtType';
import {CSRF} from '../../../modules/csrf';



@autobind
export class CourtTypesController {


  emptyCourtCodeErrorMsg = 'Court code is required and must be numeric. eg(1234)';
  getCourtTypesErrorMsg = 'A problem occurred when retrieving the list of court types.';
  updateErrorMsg = 'A problem occurred when saving the court types.';
  emptyCourtTypesErrorMsg = 'One or more court types are required for types entries.';
  private magistrateCourtType = "Magistrates' Court";
  private countyCourtType = 'County Court';
  private crownCourtType = 'Crown Court';


  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    courtCourtTypes: CourtType[] = null): Promise<void> {
    if (!courtCourtTypes) {

      const slug: string = req.params.slug as string;
      await req.scope.cradle.api.getCourtCourtTypes(slug)
        .then((value: CourtType[]) => courtCourtTypes = value)
        .catch(() => error += this.getCourtTypesErrorMsg);

    }

    let allCourtTypes: CourtType[] = [];

    await req.scope.cradle.api.getCourtTypes()
      .then((value: CourtType[]) => allCourtTypes = value)
      .catch(() => error += this.getCourtTypesErrorMsg);


    const pageData: CourtTypePageData = {
      errorMsg: error,
      updated: updated,
      items: this.mapCourtTypeToCourtTypeItem(allCourtTypes, courtCourtTypes)

    };

    res.render('courts/tabs/typesContent', pageData);
  }


  public async put(req: AuthedRequest, res: Response): Promise<void> {

    let courtCourtTypes: CourtType[] = null;

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, this.updateErrorMsg, courtCourtTypes);
    }

    if (req.body.types) {

      courtCourtTypes = this.mapBodyToCourtType(req);

      if(courtCourtTypes.find( c => (c.name === this.magistrateCourtType && this.CheckCodeIsNullOrNan(c.code))
      || (c.name === this.countyCourtType && this.CheckCodeIsNullOrNan(c.code))
      || (c.name === this.crownCourtType && this.CheckCodeIsNullOrNan(c.code)) )){

        return this.get(req, res, false, this.emptyCourtCodeErrorMsg, courtCourtTypes);
      }


      else
      {
        await req.scope.cradle.api.updateCourtCourtTypes(req.params.slug, courtCourtTypes)
          .then((value: CourtType[]) => this.get(req, res, true, '', value))
          .catch(() => this.get(req, res, false, this.updateErrorMsg, courtCourtTypes));
      }
    }
    else
    {
      return this.get(req, res, false, this.emptyCourtTypesErrorMsg, courtCourtTypes);
    }

  }

  private mapCourtTypeToCourtTypeItem(allCourtTypes: CourtType[], courtCourtTypes: CourtType[]): CourtTypeItem[] {

    if( courtCourtTypes && allCourtTypes) {
      const courtTypeItems = allCourtTypes.map((ct: CourtType) => (
        {
          value: JSON.stringify(ct),
          text: ct.name,
          magistrate: ct.name === this.magistrateCourtType ? true: false,
          county: ct.name === this.countyCourtType ? true: false,
          crown: ct.name === this.crownCourtType ? true: false,
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
        code: this.setCode(ct.name, req.body.magistratesCourtCode, req.body.countyCourtCode, req.body.crownCourtCode),
      }));

    return courtTypeItems;
  }


  private isChecked(courtType: CourtType, courtCourtTypes: CourtType[]) {
    return (courtCourtTypes.some(e => e.id === courtType.id));
  }


  private getCode(id: number, courtCourtTypes: CourtType[]) {

    return (courtCourtTypes.find(e => e.id === id) ? courtCourtTypes.find(e => e.id === id).code : null);

  }

  private setCode(name: string, magistratesCourtCode: string, countyCourtCode: string, crownCourtCode: string){

    const regExp = /^[1-9][0-9]*$/;

    switch (name) {
      case this.magistrateCourtType:
        return regExp.test(magistratesCourtCode) ? parseInt(magistratesCourtCode) : null ;

      case this.countyCourtType:
        return regExp.test(countyCourtCode) ? parseInt(countyCourtCode): null ;

      case this.crownCourtType:
        return regExp.test(crownCourtCode) ? parseInt(crownCourtCode) : null;

      default:
        return null;
    }
  }

  private CheckCodeIsNullOrNan(code: number){

    return !code || isNaN(code);
  }


}

