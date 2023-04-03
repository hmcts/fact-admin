import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {
  LocalAuthoritiesListPageData,
  LocalAuthority, LocalAuthorityItem
} from '../../../types/LocalAuthority';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';


@autobind
export class LocalAuthoritiesListController {

  getLocalAuthoritiesErrorMsg = 'A problem occurred when retrieving the list of local authorities. ';
  updateErrorMsg = 'A problem occurred when saving the local authority. ';
  emptyLocalAuthorityErrorMsg = 'The local authority name is required.';
  duplicatedErrorMsg = 'Local Authority already exists. ';
  invalidErrorMsg = 'Invalid Local Authority entered.';
  notFoundErrorMsg = 'Local Authority not found.';

  /**
   * GET /lists/local-authorities-list
   * render the view with all local authorities list
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    updatedName = '',
    selectedLocalAuthority: LocalAuthority = null): Promise<void> {

    let allLocalAuthorities: LocalAuthority[] ;
    await req.scope.cradle.api.getAllLocalAuthorities()
      .then((value: LocalAuthority[]) => allLocalAuthorities = value)
      .catch(() => error += this.getLocalAuthoritiesErrorMsg);

    const pageData: LocalAuthoritiesListPageData = {
      errorMsg: error,
      updated: updated,
      selected : selectedLocalAuthority,
      updatedName: updatedName,
      localAuthorities: this.mapLocalAuthorityToLocalAuthorityItem(allLocalAuthorities, selectedLocalAuthority)
    };

    res.render('lists/tabs/localAuthoritiesListContent', pageData);

  }
  /**
   * PUT /lists/local-authorities-list
   * validate input data and update the local authorities list and re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {

    let selectedLocalAuthority: LocalAuthority;
    const updatedName = req.body.localAuthorityName;

    if (req.body.localAuthorities){
      selectedLocalAuthority = JSON.parse(req.body.localAuthorities);
    }

    if(updatedName === '')
    {
      return this.get(req, res, false, this.emptyLocalAuthorityErrorMsg, updatedName, selectedLocalAuthority);
    }

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, this.updateErrorMsg,updatedName, selectedLocalAuthority);
    }
    else
    {
      await req.scope.cradle.api.updateLocalAuthority(selectedLocalAuthority.id , updatedName)
        .then((value: LocalAuthority) => this.get(req, res, true, '',updatedName, value))
        .catch(async (reason: AxiosError) => {
          await this.get(req, res,false, this.returnResponseMessage(reason.response?.status), updatedName, selectedLocalAuthority);
        });
    }
  }
  /**
   * map LocalAuthority to checkbox item
   */
  private mapLocalAuthorityToLocalAuthorityItem(localAuthorities: LocalAuthority[], selectedLocalAuthority: LocalAuthority): LocalAuthorityItem[] {

    if (localAuthorities) {

      const localAuthorityItems = localAuthorities.map((la: LocalAuthority) => (
        {
          id: la.name.replace(/ /g,'_'),
          value: JSON.stringify(la),
          text: la.name,
          checked : selectedLocalAuthority ? (la.id === selectedLocalAuthority.id) : false
        }));

      return localAuthorityItems.sort((a, b) => (a.text < b.text ? -1 : 1));
    }
    return [];

  }

  private returnResponseMessage(status: number ){

    switch (status) {
      case 400:
        return this.invalidErrorMsg;
      case 409:
        return this.duplicatedErrorMsg;
      case 404:
        return this.notFoundErrorMsg;
      default:
        return this.updateErrorMsg;
    }
  }


}
