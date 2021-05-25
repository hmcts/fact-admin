import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtType, CourtTypeItem, CourtTypePageData} from '../../../types/CourtType';
import {CSRF} from '../../../modules/csrf';


@autobind
export class CourtTypesController {


  emptyCourtCodeErrorMsg = 'Court code is required and must be numeric.';
  getCourtTypesErrorMsg = 'A problem occurred when retrieving the list of court types.';
  updateErrorMsg = 'A problem occurred when saving the court court types.';
  emptyCourtTypesErrorMsg = 'One or more court types are required.';
  private magistrateCourtTypeId = 11416;
  private countyCourtTypeId = 11419;
  private crownCourtTypeId = 11420;

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

      if(courtCourtTypes.find( c => (c.id === this.magistrateCourtTypeId && this.CheckCodeIsNullOrNan(c.code))
      || (c.id === this.countyCourtTypeId && this.CheckCodeIsNullOrNan(c.code))
      || (c.id === this.crownCourtTypeId && this.CheckCodeIsNullOrNan(c.code)) )){

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
      const courtTypeItems = allCourtTypes.map((ott: CourtType) => (
        {
          value: ott.id,
          text: ott.name,
          magistrate: ott.id === this.magistrateCourtTypeId ? true: false,
          county: ott.id === this.countyCourtTypeId ? true: false,
          crown: ott.id === this.crownCourtTypeId ? true: false,
          checked: this.isChecked(ott, courtCourtTypes),
          code: this.getCode(ott.id, courtCourtTypes)
        }));

      return courtTypeItems;
    }
    else
      return [];
  }


  private mapBodyToCourtType(req: AuthedRequest): CourtType[] {

    const courtTypes: string[] = Array.isArray(req.body.types) ? req.body.types : [req.body.types];


    const courtTypeItems = courtTypes.map((ct) => (
      {
        id: parseInt(ct),
        name: ct,
        code: this.setCode(ct, req.body.magistratesCourtCode, req.body.countyCourtCode, req.body.crownCourtCode),
      }));

    return courtTypeItems;
  }


  private isChecked(courtType: CourtType, courtCourtTypes: CourtType[]) {
    return (courtCourtTypes.some(e => e.id === courtType.id));
  }


  private getCode(id: number, courtCourtTypes: CourtType[]) {

    return (courtCourtTypes.find(e => e.id === id) ? courtCourtTypes.find(e => e.id === id).code : null);

  }

  private setCode(id: string, magistratesCourtCode: string, countyCourtCode: string, crownCourtCode: string){

    const regExp = /^[0-9]*$/;

    switch (id) {
      case this.magistrateCourtTypeId.toString():
        return regExp.test(magistratesCourtCode) ? parseInt(magistratesCourtCode) : null ;

      case this.countyCourtTypeId.toString():
        return regExp.test(countyCourtCode) ? parseInt(countyCourtCode): null ;

      case this.crownCourtTypeId.toString():
        return regExp.test(crownCourtCode) ? parseInt(crownCourtCode) : null;

      default:
        return null;
    }
  }

  private CheckCodeIsNullOrNan(code: number){

    return !code || isNaN(code);
  }
}

