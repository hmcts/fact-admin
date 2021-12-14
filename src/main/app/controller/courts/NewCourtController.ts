import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';

@autobind
export class NewCourtController {

  addNewCourtErrorMsg = 'A problem occurred when adding the new court';

  // Need to have the render separately
  // This method renders the header/footer and the div, and the subsequent one will constitute the content
  public async get(req: AuthedRequest,
    res: Response,
    created = false,
    redirectUrl: string,
    errors: string[] = []): Promise<void> {
    res.render('courts/addNewCourt', {
      created: created,
      redirectUrl: redirectUrl,
      errors: errors,
      csrfToken: CSRF.create()
    });
  }

  public async getNewCourtData(req: AuthedRequest,
    res: Response): Promise<void> {

    console.log('goes into GET data controller');

    res.render('courts/addNewCourtContent', {
      created: false,
      redirectUrl: '/courts',
      errors: [],
      csrfToken: CSRF.create()
    });
  }

  /**
   * POST /courts/add-court
   */
  public async addNewCourt(req: AuthedRequest, res: Response): Promise<void> {

    console.log('goes into POST controller');

    console.log('body is = ' + req.body);
    console.log('csrf token = ' + req.body._csrf);
    console.log('csrf token = ' + req.body.newCourtName);

    if(CSRF.verify(req.body._csrf)) {
      console.log('goes into csrf failure');
      return this.get(req, res, false, '', [this.addNewCourtErrorMsg]);
    }

    console.log('gets after csrf check');

    const newCourtName = req.body.newCourtName;
    console.log(newCourtName);

    const updatedSlug = newCourtName.toLowerCase()
      .replace(/[^\w\s]|_/g, '').split(' ').join('-');

    // Check there are no invalid special characters, if so, return with an error

    // Otherwise, add the new court

    // TODOs
    // separate out form into separate page, or figure out how to prevent the template being created more than once
    // check error messages appearing as expected...atm its not appearing on the list
    // remove conversion of name to slug, and instead do a check on if there are any invalid symbols, return error if so
    // make call to the api to add a new court
    // make sure the redirect on the javascript forwards on to the /courts/{slug}/generalinfo bit
    // unit tests etc
    // functional tests

    return this.get(req, res, true,'/courts/' + updatedSlug + '/edit#general', []);
  }

}
