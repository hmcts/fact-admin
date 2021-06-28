import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CourtType} from '../../../types/CourtType';
import {
  LocalAuthoritiesAreaOfLaw,
  LocalAuthoritiesPageData,
  LocalAuthority,
  LocalAuthorityItem
} from '../../../types/LocalAuthority';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {SelectItem} from '../../../types/CourtPageData';
import {CSRF} from '../../../modules/csrf';
import {familyAreaOfLaw} from '../../../utils/enums/familyAreaOfLaw'

@autobind
export class LocalAuthoritiesController {

  getCourtTypesErrorMsg = 'A problem occurred when retrieving the court types.';
  getCourtAreasOfLawErrorMsg = 'A problem occurred when retrieving the court areas of law. ';
  getLocalAuthoritiesErrorMsg = 'A problem occurred when retrieving the list of local authorities. ';
  getCourtLocalAuthoritiesErrorMsg = 'A problem occurred when retrieving the court local authorities. ';
  updateErrorMsg = 'A problem occurred when saving the local authorities. ';
  familyAreaOfLawErrorMsg = 'You need to enable relevant family court areas of law ';

  public async getAreasOfLaw(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    areasOfLaw: AreaOfLaw[] = null): Promise<void> {
    const slug: string = req.params.slug as string;

    if (!areasOfLaw ) {
      await req.scope.cradle.api.getCourtAreasOfLaw(slug)
        .then((value: AreaOfLaw[]) => areasOfLaw = value)
        .catch(() => error += this.getCourtAreasOfLawErrorMsg);
    }

    if (areasOfLaw ){
      areasOfLaw = this.checkFamilyAreasOfLaw(areasOfLaw);
      if(!areasOfLaw.length){
        error += this.familyAreaOfLawErrorMsg;
      }
    }

    let courtTypes: CourtType[] = [];
    await req.scope.cradle.api.getCourtCourtTypes(slug)
      .then((value: CourtType[]) => courtTypes = value)
      .catch(() => error += this.getCourtTypesErrorMsg);

    const pageData: LocalAuthoritiesAreaOfLaw = {
      errorMsg: error,
      updated: updated,
      isEnabled: !courtTypes.length ? false :courtTypes.some(c => c.name === 'Family Court'),
      courtAreasOfLaw: this.getAreasOfLawForSelect(areasOfLaw, ''),
    };

    res.render('courts/tabs/localAuthoritiesContent', pageData);
  }

  public async getLocalAuthorities(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    courtLocalAuthorities: LocalAuthority[] = null): Promise<void> {
    const slug: string = req.params.slug as string;
    const areaOfLaw: string = req.params.areaOfLaw as string;

    let areasOfLaw: AreaOfLaw[] = null;
    await req.scope.cradle.api.getCourtAreasOfLaw(slug)
      .then((value: AreaOfLaw[]) => areasOfLaw = this.checkFamilyAreasOfLaw(value))
      .catch(() => {
        error += this.getCourtAreasOfLawErrorMsg;
      } );

    if ( courtLocalAuthorities === null  || (courtLocalAuthorities.length < 1 && areaOfLaw != 'unknown')) {

      await req.scope.cradle.api.getCourtLocalAuthoritiesByAreaOfLaw(slug, areaOfLaw)
        .then((value: LocalAuthority[]) => courtLocalAuthorities = value)
        .catch(() => error += this.getCourtLocalAuthoritiesErrorMsg);
    }

    let allLocalAuthorities: LocalAuthority[] = [];
    await req.scope.cradle.api.getLocalAuthorities()
      .then((value: LocalAuthority[]) => allLocalAuthorities = value)
      .catch(() => error += this.getLocalAuthoritiesErrorMsg);

    const pageData: LocalAuthoritiesPageData = {
      errorMsg: error,
      updated: updated,
      selectedAreaOfLaw: areaOfLaw,
      courtAreasOfLaw: this.getAreasOfLawForSelect(areasOfLaw, areaOfLaw),
      localAuthoritiesItems: this.mapLocalAuthorityToLocalAuthorityItem(allLocalAuthorities, courtLocalAuthorities)
    };

    res.render('courts/tabs/localAuthoritiesContent', pageData);

  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {

    let localAuthorities: LocalAuthority[] = [];

    if (req.body.localAuthoritiesItems){
      localAuthorities = Array.isArray(req.body.localAuthoritiesItems) ? req.body.localAuthoritiesItems.map((la: string) => JSON.parse(la)) : [JSON.parse(req.body.localAuthoritiesItems)];
    }

    if(!CSRF.verify(req.body._csrf)) {
      return this.getLocalAuthorities(req, res, false, this.updateErrorMsg, localAuthorities);
    }
    else
    {
      await req.scope.cradle.api.updateCourtLocalAuthoritiesByAreaOfLaw(req.params.slug, req.params.areaOfLaw, localAuthorities)
        .then((value: LocalAuthority[]) => this.getLocalAuthorities(req, res, true, '', value))
        .catch(() => this.getLocalAuthorities(req, res, false, this.updateErrorMsg, localAuthorities));
    }

  }

  private mapLocalAuthorityToLocalAuthorityItem(allLocalAuthorities: LocalAuthority[], courtLocalAuthorities: LocalAuthority[]): LocalAuthorityItem[] {

    if(courtLocalAuthorities) {

      const localAuthorityItems = allLocalAuthorities.map((la: LocalAuthority) => (
        {
          value: JSON.stringify(la),
          text: la.name,
          checked: courtLocalAuthorities.some(e => e.id === la.id)
        }));

      return localAuthorityItems.sort((a, b) => (a.text < b.text ? -1 : 1));
    }
    else
    {
      return [];
    }
  }

  private checkFamilyAreasOfLaw(courtAreasOfLaw: AreaOfLaw[]){
    if(courtAreasOfLaw && courtAreasOfLaw.length) {
      return courtAreasOfLaw.filter(c => c.name == familyAreaOfLaw.children || c.name == familyAreaOfLaw.divorce
        || c.name == familyAreaOfLaw.adoption || c.name == familyAreaOfLaw.civilPartnership);
    }
    return [];
  }

  private getAreasOfLawForSelect(courtAreasOfLaw: AreaOfLaw[], selectedAreaOfLaw: string): SelectItem[] {

    if(courtAreasOfLaw && courtAreasOfLaw.length)
    {
      const defaultString = 'Select a area of law';
      const areaOfLawItems: SelectItem[] = courtAreasOfLaw.map((aol: AreaOfLaw) => (
        {value: aol.name, text: aol.name, selected: aol.name === selectedAreaOfLaw }));

      //if no item is selected then add default item on top of array
      if (!areaOfLawItems.some(c => c.selected) ) {
        areaOfLawItems.unshift({value: defaultString, text: defaultString, selected:true});
      }
      return areaOfLawItems;
    }
    else
    {
      return [];
    }
  }
}
