import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {PostcodeData} from '../../../types/Postcode';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';

@autobind
export class PostcodesController {

  getPostcodesErrorMsg = 'A problem occurred when retrieving the postcodes.';
  addErrorMsg = 'A problem has occurred when adding the following postcodes (your changes have not been saved): ';
  noPostcodeErrorMsg = 'Please update the required form below and try again.'
  duplicatePostcodeMsg = 'One or more postcodes provided already exist: ';

  public async get(
    req: AuthedRequest,
    res: Response,
    searchValue = '',
    postcodes: string[] = null,
    error = '',
    updated = false): Promise<void> {
    const slug: string = req.params.slug as string;

    const errors: Error[] = [];
    // If we have an error from validation when adding/removing or moving postcodes,
    // append it
    if (error) {
      errors.push({text: error});
    }

    if (!postcodes)
      await req.scope.cradle.api.getPostcodes(slug)
        .then((value: string[]) => postcodes = value)
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

    const existingPostcodes: string[] = req.body.existingPostcodes ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', existingPostcodes, this.addErrorMsg);
    }

    // If there is no user input
    const newPostcodes = req.body.newPostcodes;
    if (newPostcodes.length == 0) {
      return this.get(req, res, '', existingPostcodes, this.noPostcodeErrorMsg, true);
    }

    // Do an intersect between the existing and new postcodes, if any values cross over
    // then return an error specifying why
    const duplicatePostcodes = existingPostcodes.filter(
      value => newPostcodes.replace(/\s/g, '').toUpperCase().split(',').includes(String(value).toUpperCase()));
    if (duplicatePostcodes.length > 0) {
      return this.get(req, res, newPostcodes, existingPostcodes,
        this.duplicatePostcodeMsg + duplicatePostcodes, true);
    }

    // Send the new postcodes to fact-api to add them to the database
    await req.scope.cradle.api.addPostcodes(req.params.slug, newPostcodes.split(','))
      .then((value: string[]) =>
        this.get(req, res, '', existingPostcodes.concat(value), '', true))
      .catch((err: any) =>
        this.get(req, res, newPostcodes, existingPostcodes,
          this.addErrorMsg + err.response.data, false));
  }
}
