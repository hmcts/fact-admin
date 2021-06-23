import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Postcode, PostcodeData} from '../../../types/Postcode';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';

@autobind
export class PostcodesController {

  getPostcodesErrorMsg = 'A problem occurred when retrieving the postcodes.';
  addErrorMsg = 'A problem has occurred when adding new postcodes.';
  noPostcodeErrorMsg = 'Please update the required form below and try again.'
  duplicatePostcodeMsg = 'One or more postcodes provided already exist.';

  public async get(
    req: AuthedRequest,
    res: Response,
    searchValue = '',
    updated = false,
    error = '',
    postcodes: Postcode[] = null): Promise<void> {
    const slug: string = req.params.slug as string;

    const errors: Error[] = [];
    // If we have an error from validation when adding/removing or moving postcodes,
    // append it
    if (error) {
      errors.push({text: error});
    }

    if (!postcodes)
      await req.scope.cradle.api.getPostcodes(slug)
        .then((value: Postcode[]) => postcodes = value)
        .catch(() => errors.push({text: this.getPostcodesErrorMsg}));

    const pageData: PostcodeData = {
      postcodes: postcodes,
      slug: slug,
      errors: errors,
      updated: updated,
      searchValue: searchValue
    };
    res.render('courts/tabs/postcodesContent', pageData);
  }

  public async post(
    req: AuthedRequest,
    res: Response): Promise<void> {

    const existingPostcodes: Postcode[] = req.body.existingPostcodes.split(',') ?? [];
    if(!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', false, this.addErrorMsg, existingPostcodes);
    }

    // If there is no user input
    let newPostcodes = req.body.newPostcodes;
    if (newPostcodes.trim().length == 0) {
      return this.get(req, res, '', true, this.noPostcodeErrorMsg, existingPostcodes);
    }

    // Do an intersect between the existing and new postcodes, if any values cross over
    // then return an error specifying why
    newPostcodes = req.body.newPostcodes.replace(/\s/g, '').split(',');
    if (existingPostcodes.filter(value => newPostcodes.includes(value)).length > 0) {
      return this.get(req, res, newPostcodes, false, this.duplicatePostcodeMsg, existingPostcodes);
    }

    // Send the new postcodes to fact-api to add them to the database
    await req.scope.cradle.api.addPostcodes(req.params.slug, newPostcodes)
      .then((value: Postcode[]) =>
        this.get(req, res, '', true, '', existingPostcodes.concat(value)))
      .catch(() =>
        this.get(req, res, '', false, this.addErrorMsg, existingPostcodes.concat(newPostcodes)));
  }
}
