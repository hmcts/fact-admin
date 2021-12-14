import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';

@autobind
export class NewCourtController {

  addNewCourtErrorMsg = 'A problem occurred when adding the new court';
  emptyCourtNameMsg = 'A new court name value is required';

  public async get(req: AuthedRequest,
    res: Response,
    created = false,
    nameValidationPassed = true,
    emptyCourtName = false,
    redirectUrl: string,
    errorMsg: string[] = []): Promise<void> {

    res.render('courts/addNewCourt', {
      created: created,
      nameValidationPassed: nameValidationPassed,
      emptyCourtName: emptyCourtName,
      redirectUrl: redirectUrl,
      errorMsg: errorMsg,
      csrfToken: CSRF.create()
    });
  }

  public async addNewCourt(req: AuthedRequest, res: Response): Promise<void> {
    const newCourtName = req.body.newCourtName;

    if (newCourtName === '') {
      return this.get(req, res, false, true, true,
        '/courts', [this.emptyCourtNameMsg]);
    }

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, true, false,
        '/courts', [this.addNewCourtErrorMsg]);
    }

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

    return this.get(req, res, true, true, false,
      '/courts/' + updatedSlug + '/edit#general', []);
  }

}
