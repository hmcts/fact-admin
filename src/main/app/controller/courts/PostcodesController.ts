import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {PostcodeData} from '../../../types/Postcode';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {familyAreaOfLaw} from '../../../enums/familyAreaOfLaw';
import {CourtTypesAndCodes} from '../../../types/CourtTypesAndCodes';

@autobind
export class PostcodesController {

  getCourtTypesErrorMsg = 'A problem occurred when retrieving the court types.';
  getCourtAreasErrorMsg = 'A problem occurred when retrieving the court areas of law.';
  getCourtAreasOfLawErrorMsg = 'A problem occurred when retrieving the court areas of law. ';
  familyAreaOfLawErrorMsg = 'You need to enable relevant county court areas of law: Housing, Money Claims, or Bankruptcy';
  getPostcodesErrorMsg = 'A problem occurred when retrieving the postcodes.';
  getCourtsErrorMsg = 'A problem occurred when retrieving the list of courts.';
  addErrorMsg = 'A problem has occurred (your changes have not been saved). The following postcodes are invalid: ';
  deleteErrorMsg = 'A problem has occurred when attempting to delete the following postcodes: ';
  moveErrorMsg = 'A problem has occurred when attempting to move the following postcodes: ';
  moveErrorDuplicatedMsg = 'The postcode is already present on the destination court (your changes have not been saved): ';
  postcodesNotValidMsg = 'The postcode provided needs to be more than one character up to the full length of a postcode ' +
    '(your changes have not been saved): ';
  noPostcodeErrorMsg = 'Please update the required form below and try again.';
  duplicatePostcodeMsg = 'One or more postcodes provided already exist (your changes have not been saved): ';
  noSelectedPostcodeMsg = 'Please select one or more postcodes to delete.';
  noSelectedPostcodeOrCourtMsg = 'Please select one or more postcodes and a court before selecting the move option.';

  public async get(
    req: AuthedRequest,
    res: Response,
    searchValue = '',
    postcodes: string[] = null,
    error = '',
    areasOfLaw: string[] = null,
    courtTypes: string[] = null,
    updated = false): Promise<void> {
    const slug: string = req.params.slug as string;
    let fatalError = false;
    const errors: Error[] = [];
    // If we have an error from validation when adding/removing or moving postcodes,
    // append it
    if (error) {
      errors.push({text: error});
    }

    if (!areasOfLaw) {
      await req.scope.cradle.api.getCourtAreasOfLaw(slug)
        .then((value: AreaOfLaw[]) => areasOfLaw = value.map(ct => ct.name))
        .catch(() => {errors.push({text: this.getCourtAreasOfLawErrorMsg}); fatalError = true;});
    }

    if (areasOfLaw) {
      areasOfLaw = this.filterCountyAreasOfLaw(areasOfLaw).map(ct => ct.replace(/\s/g, '_'));
      if(!areasOfLaw.length){
        errors.push({text: this.familyAreaOfLawErrorMsg});
        fatalError = true;
      }
    }

    if (!courtTypes) {
      await req.scope.cradle.api.getCourtTypesAndCodes(slug)
        .then((value: CourtTypesAndCodes) => courtTypes = value.types.map(ct => ct.name.replace(/\s/g, '_')))
        .catch(() => {errors.push({text: this.getCourtTypesErrorMsg}); fatalError = true;});
    }

    if (!postcodes)
      await req.scope.cradle.api.getPostcodes(slug)
        .then((value: string[]) => postcodes = value)
        .catch(() => {errors.push({text: this.getPostcodesErrorMsg}); fatalError = true;});

    const courts = await req.scope.cradle.api.getCourts()
      .catch(() => {
        errors.push({text: this.getCourtsErrorMsg});
      }) ?? [];

    const pageData: PostcodeData = {
      postcodes: postcodes,
      courts: courts,
      slug: slug,
      errors: errors,
      updated: updated,
      searchValue: searchValue,
      isEnabled: courtTypes?.some(ct => ct === 'County_Court') ?? false,
      areasOfLaw: areasOfLaw,
      courtTypes: courtTypes,
      fatalError: fatalError,
    };
    res.render('courts/tabs/postcodesContent', pageData);
  }

  public async post(
    req: AuthedRequest,
    res: Response): Promise<void> {

    const existingPostcodes: string[] = req.body.existingPostcodes.length?
      req.body.existingPostcodes?.split(',') ?? [] : [];
    const courtTypes = req.body.courtTypes?.split(',') ?? [];
    const areasOfLaw = req.body.areasOfLaw?.split(',') ?? [];

    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', existingPostcodes, this.addErrorMsg, areasOfLaw, courtTypes);
    }

    // If there is no user input
    const newPostcodes = req.body.newPostcodes ?? [];
    if (newPostcodes.length == 0) {
      return this.get(req, res, '', existingPostcodes, this.noPostcodeErrorMsg,
        areasOfLaw, courtTypes, true);
    }

    // We should only send a postcode that is of at least size 7 (without spaces) min 2 characters
    const newPostcodesArray = newPostcodes.replace(/\s/g, '').toUpperCase().split(',');
    const invalidPostcodes = this.getInvalidPostcodes(newPostcodesArray);
    if(invalidPostcodes.length > 0) {
      return this.get(req, res, newPostcodes, existingPostcodes,
        this.postcodesNotValidMsg + invalidPostcodes, areasOfLaw, courtTypes, true);
    }

    // Do an intersect between the existing and new postcodes, if any values cross over
    // then return an error specifying why
    const duplicatePostcodes = this.getDuplicatedPostcodes(existingPostcodes, newPostcodesArray);
    if (duplicatePostcodes.length > 0) {
      return this.get(req, res, newPostcodes, existingPostcodes,
        this.duplicatePostcodeMsg + duplicatePostcodes, areasOfLaw, courtTypes, true);
    }

    // Send the new postcodes to fact-api to add them to the database
    await req.scope.cradle.api.addPostcodes(req.params.slug, newPostcodes.split(','))
      .then(async (value: string[]) =>
        await this.get(req, res, '', existingPostcodes.concat(value), '',
          areasOfLaw, courtTypes, true))
      .catch(async (reason: AxiosError) => {
        // conflict, postcode(s) already exists on the database
        await this.get(req, res, newPostcodes, existingPostcodes,
          reason.response?.status === 409
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ? this.duplicatePostcodeMsg + reason.response?.data.message
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            : this.addErrorMsg + reason.response?.data.message, areasOfLaw, courtTypes, true);
      });
  }

  public async delete(
    req: AuthedRequest,
    res: Response): Promise<void> {

    const existingPostcodes: string[] = req.body.existingPostcodes?.split(',') ?? [];
    const courtTypes = req.body.courtTypes?.split(',') ?? [];
    const areasOfLaw = req.body.areasOfLaw?.split(',') ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', existingPostcodes, this.addErrorMsg, areasOfLaw, courtTypes);
    }

    // If we have no postcodes selected
    const postcodesToDelete: string[] = req.body.selectedPostcodes ?? [];
    if (!postcodesToDelete.length) {
      return this.get(req, res, '', existingPostcodes, this.noSelectedPostcodeMsg, areasOfLaw, courtTypes);
    }

    // Send the postcodes to fact-api to delete them
    await req.scope.cradle.api.deletePostcodes(req.params.slug, postcodesToDelete)
      .then(async () => {
        // Remove the values from the existing list and return
        const existingMinusDeleted =
          existingPostcodes.filter( ( postcode ) => !postcodesToDelete.includes( postcode ) );
        await this.get(req, res, '', existingMinusDeleted, '', areasOfLaw, courtTypes, true);
      })
      .catch(async () =>
        await this.get(req, res, '', existingPostcodes,
          this.deleteErrorMsg + postcodesToDelete, areasOfLaw, courtTypes));
  }

  public async put(
    req: AuthedRequest,
    res: Response): Promise<void> {

    const existingPostcodes: string[] = req.body.existingPostcodes?.split(',') ?? [];
    const courtTypes = req.body.courtTypes?.split(',') ?? [];
    const areasOfLaw = req.body.areasOfLaw?.split(',') ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, '', existingPostcodes, this.moveErrorMsg, areasOfLaw, courtTypes);
    }

    // If we have no postcodes selected
    const postcodesToMove: string[] = req.body.selectedPostcodes ?? [];
    if (!postcodesToMove.length || !req.body.selectedCourt) {
      return this.get(req, res, '', existingPostcodes,
        this.noSelectedPostcodeOrCourtMsg, areasOfLaw, courtTypes);
    }

    // Send the postcodes to fact-api to delete them
    await req.scope.cradle.api.movePostcodes(req.params.slug, req.body.selectedCourt, postcodesToMove)
      .then(async () => {
        // Remove the values from the existing list and return
        const existingMinusDeleted =
          existingPostcodes.filter( ( postcode ) => !postcodesToMove.includes( postcode ) );
        await this.get(req, res, '', existingMinusDeleted, '', areasOfLaw, courtTypes, true);
      })
      .catch(async (reason: AxiosError) => {
        // conflict, postcode(s) already exists on the database
        await this.get(req, res, '', existingPostcodes,
          reason.response?.status === 409
            ? this.moveErrorDuplicatedMsg + reason.response?.data
            : this.moveErrorMsg + postcodesToMove, areasOfLaw, courtTypes);
      });
  }

  private filterCountyAreasOfLaw(courtAreasOfLaw: string[]): string[] {
    if(courtAreasOfLaw && courtAreasOfLaw.length) {
      // Note: the frontend for the input fields cut out the rest of the values if not for the replace below
      return courtAreasOfLaw.map(c => c.replace('_', ' '))
        .filter(c => c == familyAreaOfLaw.moneyClaims || c == familyAreaOfLaw.housing
        || c == familyAreaOfLaw.bankruptcy);
    }
    return [];
  }

  private getInvalidPostcodes(newPostcodesArray: string[]): string[] {
    return newPostcodesArray.filter((value: string) => value.length < 2 || value.length > 7);
  }

  private getDuplicatedPostcodes(existingPostcodes: string[], newPostcodesArray: string[]): string[] {
    return existingPostcodes.filter(
      value => newPostcodesArray.includes(String(value).toUpperCase()));
  }
}
