import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {PostcodeData} from '../../../types/Postcode';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {familyAreaOfLaw} from '../../../enums/familyAreaOfLaw';
import {CourtType} from '../../../types/CourtType';

@autobind
export class PostcodesController {

  getCourtTypesErrorMsg = 'A problem occurred when retrieving the court types.';
  getCourtAreasErrorMsg = 'A problem occurred when retrieving the court areas of law.';
  getCourtAreasOfLawErrorMsg = 'A problem occurred when retrieving the court areas of law. ';
  familyAreaOfLawErrorMsg = 'You need to enable relevant family court areas of law ';
  getPostcodesErrorMsg = 'A problem occurred when retrieving the postcodes.';
  addErrorMsg = 'A problem has occurred (your changes have not been saved). The following postcodes are invalid: ';
  deleteErrorMsg = 'A problem has occurred when attempting to delete the following postcodes: ';
  moveErrorMsg = 'A problem has occurred when attempting to move the following postcodes: ';
  moveErrorDuplicatedMsg = 'The postcode is already present on the destination court: ';
  postcodesNotValidMsg = 'The postcode provided needs to be more than one character up to the full length of a postcode: '
  noPostcodeErrorMsg = 'Please update the required form below and try again.'
  duplicatePostcodeMsg = 'One or more postcodes provided already exist: ';
  noSelectedPostcodeMsg = 'Please select one or more postcodes to delete.'
  noSelectedPostcodeOrCourtMsg = 'Please select one or more postcodes and a court before selecting the move option.'

  public async get(
    req: AuthedRequest,
    res: Response,
    searchValue = '',
    postcodes: string[] = null,
    error = '',
    updated = false,
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

    let courtTypes: CourtType[] = [];
    await req.scope.cradle.api.getCourtCourtTypes(slug)
      .then((value: CourtType[]) => courtTypes = value)
      .catch(() => error += this.getCourtTypesErrorMsg);

    const pageData: PostcodeData = {
      postcodes: postcodes,
      courts: courts,
      slug: slug,
      errors: errors,
      updated: updated,
      searchValue: searchValue,
      isEnabled: !courtTypes.length ? false :courtTypes.some(c => c.name === 'Family Court')
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
      .catch((reason: AxiosError) => {

        // conflict, postcode(s) already exists on the database
        if(reason.response?.status === 409) {
          this.get(req, res, newPostcodes, existingPostcodes,
            this.duplicatePostcodeMsg + reason.response?.data);
        }
        else {
          this.get(req, res, newPostcodes, existingPostcodes,
            this.addErrorMsg + reason.response?.data);
        }
      });
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
    if (!postcodesToMove.length || !req.body.selectedCourt) {
      return this.get(req, res, '', existingPostcodes, this.noSelectedPostcodeOrCourtMsg);
    }

    // Send the postcodes to fact-api to delete them
    await req.scope.cradle.api.movePostcodes(req.params.slug, req.body.selectedCourt, postcodesToMove)
      .then(() => {
        // Remove the values from the existing list and return
        const existingMinusDeleted =
          existingPostcodes.filter( ( postcode ) => !postcodesToMove.includes( postcode ) );
        this.get(req, res, '', existingMinusDeleted, '', true);
      })
      .catch((reason: AxiosError) => {
        // conflict, postcode(s) already exists on the database
        if(reason.response?.status === 409) { // conflict, postcode already exists on the destination court
          this.get(req, res, '', existingPostcodes,
            this.moveErrorDuplicatedMsg + postcodesToMove);
        }
        else {
          this.get(req, res, '', existingPostcodes,
            this.moveErrorMsg + postcodesToMove);
        }
      });
  }

  private checkFamilyAreasOfLaw(courtAreasOfLaw: AreaOfLaw[]): AreaOfLaw[]{
    if(courtAreasOfLaw && courtAreasOfLaw.length) {
      return courtAreasOfLaw.filter(c => c.name == familyAreaOfLaw.moneyClaims || c.name == familyAreaOfLaw.housing
        || c.name == familyAreaOfLaw.bankruptcy);
    }
    return [];
  }
}
