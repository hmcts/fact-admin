import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtType, CourtTypeItem, CourtTypePageData} from '../../../types/CourtType';

@autobind
export class CourtTypesController {


  emptyCourtCodeErrorMsg = 'Court code is required and must be numeric.';
  getCourtTypesErrorMsg = 'A problem occurred when retrieving the list of court types.';
  updateErrorMsg = 'A problem occurred when saving the court court types.';
  emptyCourtTypesErrorMsg = 'One or more court types are required.';


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

    if (req.body.types) {

      courtCourtTypes = this.mapBodyToCourtType(req.body);

      if(courtCourtTypes.find( c => (c.name ==="Magistrates' Court" && !c.code ) || (c.name ==="Magistrates' Court" && isNaN(c.code))
      || (c.name==='County Court' && !c.code) || (c.name ==='County Court' && isNaN(c.code))
      || (c.name === 'Crown Court' && !c.code)  || (c.name ==='Crown Court' && isNaN(c.code)))){

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
          value: ott.id + ',' + ott.name,
          text: ott.name,
          checked: this.isChecked(ott, courtCourtTypes),
          code: this.getCode(ott.id, courtCourtTypes)
        }));

      return courtTypeItems;
    }
    else
      return [];
  }


  private mapBodyToCourtType(body: any): CourtType[] {

    const courtTypes: string[] = Array.isArray(body.types) ? body.types : [body.types];

    const courtTypeItems = courtTypes.map((ct) => (
      {
        id: parseInt(ct.split(',',2)[0]),
        name: ct.split(',',2)[1],
        code:this.setCode(ct.split(',',2)[1], body.magistratesCourtCode, body.countyCourtCode, body.crownCourtCode),

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

    const regExp = /[a-zA-Z]/g;

    switch (name) {
      case "Magistrates' Court":
        return regExp.test(magistratesCourtCode) ? null : parseInt(magistratesCourtCode);

      case 'County Court':
        return regExp.test(countyCourtCode) ? null : parseInt(countyCourtCode) ;

      case 'Crown Court':
        return regExp.test(crownCourtCode) ? null : parseInt(crownCourtCode);

      default:
        return null;
    }
  }
}

