import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {PostcodeData} from '../../../types/Postcode';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';

@autobind
export class PostcodesController {

  getPostcodesErrorMsg = 'A problem occurred when retrieving the postcodes.';
  addErrorMsg = 'A problem has occurred (your changes have not been saved). The following postcodes are invalid: ';
  deleteErrorMsg = 'A problem has occurred when attempting to delete the following postcodes: ';
  moveErrorMsg = 'A problem has occurred when attempting to move the following postcodes: ';
  postcodesNotValidMsg = 'The postcode provided needs to be more than one character up to the full length of a postcode: '
  noPostcodeErrorMsg = 'Please update the required form below and try again.'
  duplicatePostcodeMsg = 'One or more postcodes provided already exist: ';
  noSelectedPostcodeMsg = 'Please select one or more postcodes to move or delete.'

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

    const courts = await req.scope.cradle.api.getCourts();

    const pageData: PostcodeData = {
      postcodes: postcodes,
      courts: courts,
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

    const existingPostcodes: string[] = req.body.existingPostcodes?.split(',') ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', existingPostcodes, this.addErrorMsg);
    }

    // If there is no user input
    const newPostcodes = req.body.newPostcodes;
    if (newPostcodes.length == 0) {
      return this.get(req, res, '', existingPostcodes, this.noPostcodeErrorMsg, true);
    }

    // We should only send a postcode that is of at least size 7 (without spaces) min 2 characters
    const newPostcodesArray = newPostcodes.replace(/\s/g, '').toUpperCase().split(',');
    const invalidPostcodes = newPostcodesArray.filter((value: string) => value.length < 2 || value.length > 7);
    if(invalidPostcodes.length > 0) {
      return this.get(req, res, newPostcodes, existingPostcodes, this.postcodesNotValidMsg + invalidPostcodes);
    }

    // Do an intersect between the existing and new postcodes, if any values cross over
    // then return an error specifying why
    const duplicatePostcodes = existingPostcodes.filter(
      value => newPostcodesArray.includes(String(value).toUpperCase()));
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
          this.addErrorMsg + err.response.data));
  }

  public async delete(
    req: AuthedRequest,
    res: Response): Promise<void> {

    const existingPostcodes: string[] = req.body.existingPostcodes?.split(',') ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', existingPostcodes, this.addErrorMsg);
    }

    // If we have no postcodes selected
    const postcodesToDelete: string[] = req.body.selectedPostcodes ?? [];
    if (!postcodesToDelete.length) {
      return this.get(req, res, '', existingPostcodes, this.noSelectedPostcodeMsg);
    }

    // Send the postcodes to fact-api to delete them
    await req.scope.cradle.api.deletePostcodes(req.params.slug, postcodesToDelete)
      .then(() => {
        // Remove the values from the existing list and return
        const existingMinusDeleted =
          existingPostcodes.filter( ( postcode ) => !postcodesToDelete.includes( postcode ) );
        this.get(req, res, '', existingMinusDeleted, '', true);
      })
      .catch(() =>
        this.get(req, res, '', existingPostcodes,
          this.deleteErrorMsg + postcodesToDelete));
  }

  public async put(
    req: AuthedRequest,
    res: Response): Promise<void> {

    const existingPostcodes: string[] = req.body.existingPostcodes?.split(',') ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', existingPostcodes, this.moveErrorMsg);
    }

    // If we have no postcodes selected
    const postcodesToMove: string[] = req.body.selectedPostcodes ?? [];
    if (!postcodesToMove.length) {
      return this.get(req, res, '', existingPostcodes, this.noSelectedPostcodeMsg);
    }

    // Send the postcodes to fact-api to delete them
    await req.scope.cradle.api.movePostcodes(req.params.slug, req.body.selectedCourt, postcodesToMove)
      .then(() => {
        // Remove the values from the existing list and return
        const existingMinusDeleted =
          existingPostcodes.filter( ( postcode ) => !postcodesToMove.includes( postcode ) );
        this.get(req, res, '', existingMinusDeleted, '', true);
      })
      .catch(() =>
        this.get(req, res, '', existingPostcodes,
          this.deleteErrorMsg + postcodesToMove));
  }
}
