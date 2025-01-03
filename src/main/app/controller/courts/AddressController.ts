import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {AxiosError} from 'axios';
import {CSRF} from '../../../modules/csrf';
import {
  AddressType,
  AddressValidationResult,
  CourtAddress,
  DisplayAddress,
  DisplayCourtAddresses,
  FieldsOfLaw
} from '../../../types/CourtAddress';
import {CourtAddressPageData} from '../../../types/CourtAddressPageData';
import {SelectItem} from '../../../types/CourtPageData';
import {postcodeIsValidFormat, replaceMultipleSpaces} from '../../../utils/validation';
import {County} from '../../../types/County';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {RadioItem} from '../../../types/RadioItem';
import {CourtType} from '../../../types/CourtType';
import {compareAddressLines, removeSpecialCharacters} from '../../../utils/AddressUtils';

@autobind
export class AddressController {

  getCourtTypesErrorMsg = 'A problem occurred when retrieving the court types.';
  getAreasOfLawErrorMsg = 'A problem occurred when retrieving the areas of law.';
  getAddressTypesError = 'A problem occurred when retrieving the court address types.';
  getAddressesError = 'A problem occurred when retrieving the court addresses.';
  getCountyError = 'A problem occurred when retrieving the counties';
  updateAddressError = 'A problem occurred when saving the court addresses.';
  multipleVisitAddressError = 'Only one visit address is permitted.';
  typeRequiredError = 'Address Type is required.';
  countyRequiredError = 'County is required. ';
  addressRequiredError = 'Address is required.';
  townRequiredError = 'Town is required.';
  invalidPostcodeError = 'Postcode is invalid.';
  invalidEpimError = 'ePIMS Ref ID is invalid. Must contain alphanumeric and/or '
    + 'dashes (-) and length should be 30 characters or less.';
  postcodeMissingError = 'Postcode is required.';
  postcodeNotFoundError = 'Postcode entered could not be found.';
  writeToUsAddressType = 'Write to us';
  visitOrContactUsAddressType = 'Visit or contact us';
  primaryAddressPrefix = 'Primary Address: ';
  secondaryAddressPrefix = 'Secondary Address 1: ';
  thirdAddressPrefix = 'Secondary Address 2: ';
  fieldsOfLawDuplicateError = 'Secondary addresses cannot have duplicate areas of law or court types selected. '
    + 'Conflicting options selected are: ';
  duplicateAddressError = 'All addresses must be unique.';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';
  dupilcateWelshAddressError = 'All welsh addresses must be unique.';

  /**
   * GET /courts/:slug/addresses
   * render the view with data from database for court addresses
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  /**
   * PUT /courts/:slug/addresses
   * validate input data and update the court addresses then re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const addresses: DisplayCourtAddresses = {
      primary: req.body.primary,
      secondary: req.body.secondary,
    };

    replaceMultipleSpaces(addresses.primary);
    replaceMultipleSpaces(addresses.secondary[0]);
    replaceMultipleSpaces(addresses.secondary[1]);

    const errors = [];
    const areasOfLaw = await req.scope.cradle.api.getAllAreasOfLaw()
      .then((results: AreaOfLaw[]) => {
        return results;
      })
      .catch(() => {
        errors.push(this.getAreasOfLawErrorMsg);
      });
    const courtTypes = await req.scope.cradle.api.getCourtTypes()
      .then((results: AreaOfLaw[]) => {
        return results;
      })
      .catch(() => {
        errors.push(this.getCourtTypesErrorMsg);
      });

    // Make sure the primary addresses are empty
    addresses.primary.fields_of_law = {
      areas_of_law: [],
      courts: []
    };


    addresses.secondary[0].fields_of_law = this.getAPIFieldsOfLaw(req.body.secondary[0].secondaryFieldsOfLawRadio,
      req.body.secondaryAddressAOLItems0, req.body.secondaryAddressCourtItems0);
    addresses.secondary[1].fields_of_law = this.getAPIFieldsOfLaw(req.body.secondary[1].secondaryFieldsOfLawRadio,
      req.body.secondaryAddressAOLItems1, req.body.secondaryAddressCourtItems1 );

    // Validate token
    if (!CSRF.verify(req.body._csrf)) {
      await this.render(req, res, false,
        this.convertToDisplayAddresses([
          addresses.primary as unknown as CourtAddress,
          addresses.secondary[0] as unknown as CourtAddress,
          addresses.secondary[1] as unknown as CourtAddress,
        ], areasOfLaw, courtTypes), [this.updateAddressError]);
      return;
    }

    // Validate addresses
    const writeToUsTypeId = req.body.writeToUsTypeId;
    const addressesValid = this.validateCourtAddresses(addresses, writeToUsTypeId);
    if (addressesValid.errors.length > 0) {
      await this.render(req, res, false,
        this.convertToDisplayAddresses([
          addresses.primary as unknown as CourtAddress,
          addresses.secondary[0] as unknown as CourtAddress,
          addresses.secondary[1] as unknown as CourtAddress,
        ], areasOfLaw, courtTypes), addressesValid.errors,
        !addressesValid.primaryPostcodeValid,
        !addressesValid.secondaryPostcodeValid,
        !addressesValid.thirdPostcodeValid,
        !addressesValid.primaryEpimValid
      );
      return;
    }

    // Post addresses to API if valid
    await req.scope.cradle.api.updateCourtAddresses(req.params.slug, this.convertToApiType(addresses, writeToUsTypeId))
      .then(async (addressList: CourtAddress[]) => {
        await this.render(req, res, true, this.convertToDisplayAddresses(addressList, areasOfLaw, courtTypes));
      })
      .catch(async (reason: AxiosError) => {
        if (reason.response.status === 400) {
          const postcodeValidation = this.checkErrorResponseForPostcodeErrors(reason, addresses);
          const errors = postcodeValidation.errors.length === 0
            ? [this.updateAddressError] // we've encountered a 400 for a reason other than postcodes
            : postcodeValidation.errors;
          await this.render(req, res, false,
            this.convertToDisplayAddresses([
              addresses.primary as unknown as CourtAddress,
              addresses.secondary[0] as unknown as CourtAddress,
              addresses.secondary[1] as unknown as CourtAddress,
            ], areasOfLaw, courtTypes), errors, postcodeValidation.primaryInvalid,
            postcodeValidation.secondaryInvalid, postcodeValidation.thirdInvalid);
        }
        else if (reason.response.status === 409) {
          const error = this.courtLockedExceptionMsg + (<any>reason.response).data['message'];
          await this.render(req, res, false,
            this.convertToDisplayAddresses([
              addresses.primary as unknown as CourtAddress,
              addresses.secondary[0] as unknown as CourtAddress,
              addresses.secondary[1] as unknown as CourtAddress,
            ], areasOfLaw, courtTypes), [error]);
        }
        else {
          await this.render(req, res, false,
            this.convertToDisplayAddresses([
              addresses.primary as unknown as CourtAddress,
              addresses.secondary[0] as unknown as CourtAddress,
              addresses.secondary[1] as unknown as CourtAddress,
            ], areasOfLaw, courtTypes), [this.updateAddressError]);
        }
      });
  }

  /**
   * render the view with data from database for court addresses
   */
  private async render(
    req: AuthedRequest,
    res: Response,
    updated = false,
    addresses: DisplayCourtAddresses = null,
    errorMsgs: string[] = [],
    primaryPostcodeInvalid = false,
    secondaryPostcodeInvalid = false,
    thirdPostcodeInvalid = false,
    primaryEpimInvalid = false
  ) {

    const slug: string = req.params.slug;
    let fatalError = false;

    if (!addresses) {
      // Get the addresses and also keep the list for later so we can determine which
      // court types are selected further down
      const areasOfLaw = await req.scope.cradle.api.getAllAreasOfLaw()
        .then((results: AreaOfLaw[]) => {
          return results;
        })
        .catch(() => {
          errorMsgs.push(this.getAreasOfLawErrorMsg);
          fatalError = true;
        });

      const courtTypes = await req.scope.cradle.api.getCourtTypes()
        .then((results: CourtType[]) => {
          return results;
        })
        .catch(() => {
          errorMsgs.push(this.getCourtTypesErrorMsg);
          fatalError = true;
        });

      await req.scope.cradle.api.getCourtAddresses(slug)
        .then((addressList: CourtAddress[]) => {
          if (areasOfLaw && courtTypes) {
            addresses = this.convertToDisplayAddresses(addressList, areasOfLaw, courtTypes);
          }
        })
        .catch((e: any) => {
          errorMsgs.push(this.getAddressesError);
          fatalError = true;
        });
    }

    let addressTypes: AddressType[] = [];
    await req.scope.cradle.api.getAddressTypes()
      .then((types: AddressType[]) => addressTypes = types)
      .catch(() => {
        errorMsgs.push(this.getAddressTypesError);
        fatalError = true;
      });

    let counties: County[] = [];
    await req.scope.cradle.api.getCounties()
      .then((countyList: County[]) => counties = countyList)
      .catch(() => {
        errorMsgs.push(this.getCountyError);
        fatalError = true;
      });

    // We expect a 'write to us' address type and use this to ensure that if 2 addresses are entered,
    // at least one is of this type (2 'visit' addresses are not permitted).
    const writeToUsTypes = addressTypes.filter(at => at.name.toLowerCase() === this.writeToUsAddressType.toLowerCase()).map(at => at.id);

    const pageData: CourtAddressPageData = {
      addressTypesPrimary: this.getAddressTypesForSelect(addressTypes, true),
      addressTypesSecondary: this.getAddressTypesForSelect(addressTypes, false),
      counties: this.getCountiesForSelect(counties),
      addresses: addresses,
      writeToUsTypeId: writeToUsTypes.length === 1 ? writeToUsTypes[0] : null,
      errors: errorMsgs.map(errorMsg => {
        return {text: errorMsg};
      }),
      fatalError: fatalError,
      primaryPostcodeInvalid: primaryPostcodeInvalid,
      secondaryPostcodeInvalid: secondaryPostcodeInvalid,
      thirdPostcodeInvalid: thirdPostcodeInvalid,
      primaryEpimInvalid: primaryEpimInvalid,
      updated: updated
    };

    res.render('courts/tabs/addressesContent', pageData);
  }
  /**
   * mapping the Area of Law model to radio Item in order to be rendered correctly
   */
  private mapAreaOfLawToRadioItem(allAreasOfLaw: AreaOfLaw[], courtAreasOfLaw: RadioItem[], dataPrefix: string): RadioItem[] {

    if (courtAreasOfLaw) {

      const areaOfLawItems = allAreasOfLaw.map((aol: AreaOfLaw) => (
        {
          id: aol.id,
          value: JSON.stringify(aol),
          text: aol.name,
          checked: courtAreasOfLaw.some(e => e.id === aol.id),
          attributes: {
            'data-name': dataPrefix + aol.name
          }
        }));

      return areaOfLawItems.sort((a, b) => (a.text < b.text ? -1 : 1));
    } else {
      return [];
    }
  }
  /**
   * mapping the CourtType model to radio Item in order to be rendered correctly
   */
  private mapCourtTypeToRadioItem(allCourtTypes: CourtType[], courtType: RadioItem[], dataPrefix: string): RadioItem[] {

    if (allCourtTypes) {

      const courtTypeItems = allCourtTypes.map((ct: CourtType) => (
        {
          id: ct.id,
          value: JSON.stringify(ct),
          text: ct.name,
          checked: courtType.some(e => e.id === ct.id),
          attributes: {
            'data-name': dataPrefix + ct.name
          }
        }));

      return courtTypeItems.sort((a, b) => (a.text < b.text ? -1 : 1));
    } else {
      return [];
    }
  }
  /**
   * validating court addresses entered
   */
  private validateCourtAddresses(addresses: DisplayCourtAddresses, writeToUsTypeId: number):
    { primaryPostcodeValid: boolean; secondaryPostcodeValid: boolean; thirdPostcodeValid: boolean;
      primaryEpimValid: boolean, errors: string[] } {

    const primaryValidationResult = this.validateCourtAddress(addresses.primary, true, false);
    const secondaryValidationResult = this.validateCourtAddress(addresses.secondary[0], false, true);
    const thirdValidationResult = this.validateCourtAddress(addresses.secondary[1], false, false);
    const addressTypeErrors = this.validateNoMoreThanOneVisitAddress([addresses.primary, addresses.secondary[0], addresses.secondary[1]], writeToUsTypeId);
    const fieldsOfLawErrors = this.validateFieldsOfLaw([addresses.secondary[0].fields_of_law, addresses.secondary[1].fields_of_law]);
    const uniqueAddressError = this.checkAddressesAreUnique(addresses);
    const allErrors = primaryValidationResult.errors
      .concat(secondaryValidationResult.errors)
      .concat(addressTypeErrors)
      .concat(thirdValidationResult.errors)
      .concat(fieldsOfLawErrors)
      .concat(uniqueAddressError);

    return {
      primaryPostcodeValid: primaryValidationResult.postcodeValid,
      secondaryPostcodeValid: secondaryValidationResult.postcodeValid,
      thirdPostcodeValid: thirdValidationResult.postcodeValid,
      primaryEpimValid: primaryValidationResult.epimValid,
      errors: allErrors
    };
  }

  private validateCourtAddress(address: DisplayAddress, isPrimaryAddress: boolean, isSecondaryAddress: boolean): AddressValidationResult {
    const typeErrors = this.validateAddressTypeExists(address, isPrimaryAddress);
    const countyErrors = this.validateCountyExists(address);
    const addressErrors = this.validateAddressLines(address, isPrimaryAddress);
    const postcodeErrors = this.validatePostcode(address, isPrimaryAddress);
    const epimErrors = this.validateEPIMId(address);
    const errorPrefix = isPrimaryAddress ? this.primaryAddressPrefix : (isSecondaryAddress ? this.secondaryAddressPrefix : this.thirdAddressPrefix);

    return {
      postcodeValid: postcodeErrors.length === 0,
      addressValid: addressErrors.length === 0,
      epimValid: epimErrors.length === 0,
      errors: typeErrors.concat(countyErrors)
        .concat(addressErrors)
        .concat(postcodeErrors)
        .concat(epimErrors)
        .map(error => errorPrefix + error)
    };
  }

  private validateAddressTypeExists(address: DisplayAddress, isPrimaryAddress: boolean): string[] {
    if (isPrimaryAddress || (!!address.postcode || this.addressFieldsNotEmpty(address))) {
      return !address.type_id ? [this.typeRequiredError] : [];
    }
    return [];
  }

  private validateCountyExists(address: DisplayAddress): string[] {
    if (!!address.postcode || this.addressFieldsNotEmpty(address)) {
      return !address.county_id ? [this.countyRequiredError] : [];
    }
    return [];
  }

  private validateAddressLines(address: DisplayAddress, isPrimaryAddress: boolean): string[] {
    const validateSecondaryAddress = (!isPrimaryAddress && (this.addressFieldsNotEmpty(address) || address.postcode?.trim()));
    const errors: string[] = [];

    if (isPrimaryAddress || validateSecondaryAddress) {
      if (!address.address_lines?.trim()) {
        errors.push(this.addressRequiredError);
      }
      if (!address.town?.trim()) {
        errors.push(this.townRequiredError);
      }
    }
    return errors;
  }

  private validateFieldsOfLaw(addressFolItems: FieldsOfLaw[]): string[] {
    // Check for the address sent, that the fields of law for all addresses to not overlap with one another
    // in other words, that there are no duplicates
    const errors: string[] = [];
    const duplicateAreasOfLaw = addressFolItems[0].areas_of_law
      .map((aol: AreaOfLaw) => aol.name)
      .filter((name: string) => addressFolItems[1].areas_of_law
        .map((aol: AreaOfLaw) => aol.name)
        .includes(name));
    const duplicateCourts = addressFolItems[0].courts
      .map((court: CourtType) => court.name)
      .filter((name: string) => addressFolItems[1].courts
        .map((court: CourtType) => court.name)
        .includes(name));
    if (duplicateAreasOfLaw.length > 0 || duplicateCourts.length > 0) {
      errors.push(this.fieldsOfLawDuplicateError + '"'
        + duplicateAreasOfLaw
        + (duplicateAreasOfLaw.length > 0 ? ', ': '')
        + duplicateCourts + '"');
    }
    return errors;
  }

  private validatePostcode(courtAddress: DisplayAddress, isPrimaryAddress: boolean): string[] {
    const errors: string[] = [];
    const postcodeRequired = isPrimaryAddress || (!isPrimaryAddress && this.addressFieldsNotEmpty(courtAddress));
    const postcodeEmpty = !courtAddress?.postcode?.trim();

    if (postcodeRequired && postcodeEmpty) {
      errors.push(this.postcodeMissingError);
    }

    if (!postcodeEmpty && !postcodeIsValidFormat(courtAddress.postcode)) {
      errors.push(this.invalidPostcodeError);
    }

    return errors;
  }

  private validateEPIMId(courtAddress: DisplayAddress): string[] {
    const errors: string[] = [];
    const regex = /^[a-zA-Z0-9-]{0,30}$/;
    if (courtAddress.epim_id && !regex.test(courtAddress.epim_id?.trim())) {
      errors.push(this.invalidEpimError);
    }
    return errors;
  }

  private validateNoMoreThanOneVisitAddress(addresses: DisplayAddress[], writeToUsTypeId: number): string[] {

    return (writeToUsTypeId && !!addresses[0].type_id && !!addresses[1].type_id) &&
    (!(addresses[2].type_id) && this.addressFieldsNotEmpty(addresses[1]) && (addresses.filter(add => add.type_id !== writeToUsTypeId).length) > 2) ||
    (!!addresses[2].type_id && this.addressFieldsNotEmpty(addresses[1]) && (addresses.filter(add => add.type_id !== writeToUsTypeId).length) > 1)
      ? [this.multipleVisitAddressError]
      : [];
  }

  private addressFieldsNotEmpty(courtAddress: DisplayAddress): boolean {
    return !!courtAddress.address_lines?.trim() || !!courtAddress.address_lines_cy?.trim() ||
      !!courtAddress.town?.trim() || !!courtAddress.town_cy?.trim();
  }

  private getAddressTypesForSelect(addressTypes: AddressType[], isPrimaryAddress: boolean): SelectItem[] {
    const allAddressTypes = addressTypes.map((at: AddressType) => ({value: at.id, text: at.name, selected: false}));

    return isPrimaryAddress
      ? allAddressTypes
      : allAddressTypes.filter(at => at.text.toLowerCase() !== this.visitOrContactUsAddressType.toLowerCase());
  }

  private getCountiesForSelect(counties: County[]): SelectItem[] {
    return counties.map((ct: County) => (
      {value: ct.id, text: ct.name, selected: false}));
  }

  private checkErrorResponseForPostcodeErrors(error: AxiosError, addresses: DisplayCourtAddresses):
    { primaryInvalid: boolean; secondaryInvalid: boolean; thirdInvalid: boolean; errors: string[] } {

    let primaryPostcodeInvalid = false;
    let secondaryPostcodeInvalid = false;
    let thirdPostcodeInvalid = false;
    const errors: string[] = [];

    // We expect an array of invalid postcodes in the body of the response
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const invalidPostcodes = error.response.data.message ? error.response.data.message.split(','): error.response.data.message;
    if (Array.isArray(invalidPostcodes)) {
      invalidPostcodes.forEach(invalidPostcode => {
        if (!primaryPostcodeInvalid && invalidPostcode.toUpperCase() === addresses.primary?.postcode?.toUpperCase()) {
          primaryPostcodeInvalid = true;
          errors.push(this.primaryAddressPrefix + this.postcodeNotFoundError);
        }
        if (!secondaryPostcodeInvalid && invalidPostcode.toUpperCase() === addresses.secondary[0]?.postcode?.toUpperCase()) {
          secondaryPostcodeInvalid = true;
          errors.push(this.secondaryAddressPrefix + this.postcodeNotFoundError);
        } else if (!thirdPostcodeInvalid && invalidPostcode.toUpperCase() === addresses.secondary[1]?.postcode?.toUpperCase()) {
          thirdPostcodeInvalid = true;
          errors.push(this.thirdAddressPrefix + this.postcodeNotFoundError);
        }
      });
    }

    return {
      primaryInvalid: primaryPostcodeInvalid,
      secondaryInvalid: secondaryPostcodeInvalid,
      thirdInvalid: thirdPostcodeInvalid,
      errors: errors
    };
  }

  private convertToDisplayAddresses(addresses: CourtAddress[], areasOfLaw: AreaOfLaw[],
    courtTypes: CourtType[]): DisplayCourtAddresses {
    const courtAddresses: DisplayCourtAddresses = {primary: {}, secondary: [{},{}]};

    switch (addresses.length) {
      case 0: {
        courtAddresses.primary.fields_of_law = this.createEmptyFieldsOfLawCheckboxItems(areasOfLaw, courtTypes, 'primary');
        courtAddresses.secondary[0].fields_of_law = this.createEmptyFieldsOfLawCheckboxItems(areasOfLaw, courtTypes, 'secondary');
        courtAddresses.secondary[1].fields_of_law = this.createEmptyFieldsOfLawCheckboxItems(areasOfLaw, courtTypes, 'third');
        break;
      }
      case 1: {
        courtAddresses.primary = this.convertApiAddressToCourtAddressType(addresses[0], areasOfLaw, courtTypes, 'primary');
        courtAddresses.secondary[0].fields_of_law = this.createEmptyFieldsOfLawCheckboxItems(areasOfLaw, courtTypes, 'secondary');
        courtAddresses.secondary[1].fields_of_law = this.createEmptyFieldsOfLawCheckboxItems(areasOfLaw, courtTypes, 'third');
        break;
      }
      case 2: {
        courtAddresses.primary = this.convertApiAddressToCourtAddressType(addresses[0], areasOfLaw, courtTypes, 'primary');
        courtAddresses.secondary[0] = this.convertApiAddressToCourtAddressType(addresses[1], areasOfLaw, courtTypes, 'secondary');
        courtAddresses.secondary[1].fields_of_law = this.createEmptyFieldsOfLawCheckboxItems(areasOfLaw, courtTypes, 'third');
        break;
      }
      case 3: {
        courtAddresses.primary = this.convertApiAddressToCourtAddressType(addresses[0], areasOfLaw, courtTypes, 'primary');
        courtAddresses.secondary[0] = this.convertApiAddressToCourtAddressType(addresses[1], areasOfLaw, courtTypes, 'secondary');
        courtAddresses.secondary[1] = this.convertApiAddressToCourtAddressType(addresses[2], areasOfLaw, courtTypes, 'third');
        break;
      }
      default: {
        throw new RangeError('Only expecting three addresses at max for now');
      }
    }

    return courtAddresses;
  }

  private createEmptyFieldsOfLawCheckboxItems(areasOfLaw: AreaOfLaw[], courtTypes: CourtType[],
    dataPrefix: string): FieldsOfLaw {
    return {
      areas_of_law: this.mapAreaOfLawToRadioItem(areasOfLaw, [], dataPrefix),
      courts: this.mapCourtTypeToRadioItem(courtTypes, [], dataPrefix),
    };
  }

  private convertToApiType(courtAddresses: DisplayCourtAddresses, writeToUsTypeId: number): CourtAddress[] {
    let apiAddresses: CourtAddress[] = [];
    let visitUsAddress: CourtAddress[] = [];

    if (courtAddresses.primary) {
      apiAddresses.push(this.convertCourtAddressToApiAddressType(courtAddresses.primary));
    }
    if (courtAddresses.secondary[0] && courtAddresses.secondary[0].type_id && courtAddresses.secondary[0].address_lines &&
      courtAddresses.secondary[0].town && courtAddresses.secondary[0].postcode) {
      apiAddresses.push(this.convertCourtAddressToApiAddressType(courtAddresses.secondary[0]));
    }
    if (courtAddresses.secondary[1] && courtAddresses.secondary[1].type_id && courtAddresses.secondary[1].address_lines &&
      courtAddresses.secondary[1].town && courtAddresses.secondary[1].postcode) {
      apiAddresses.push(this.convertCourtAddressToApiAddressType(courtAddresses.secondary[1]));
    }
    //need to make sure that visit us address is saved in first index of the addresses array being posted to the api.
    visitUsAddress = apiAddresses.filter(c => c.type_id !== writeToUsTypeId);
    apiAddresses = visitUsAddress.concat(apiAddresses.filter(c => c.type_id == writeToUsTypeId));
    return apiAddresses;
  }

  private getAPIFieldsOfLaw(radioOption: string, aolItems: any, courtItems: any): any {
    return radioOption == 'yes' ? {
      areas_of_law:
        aolItems ? Array.isArray(aolItems)
          ? aolItems.map((aol: string) => JSON.parse(aol))
          : [JSON.parse(aolItems)] : [],
      courts:
        courtItems ? Array.isArray(courtItems)
          ? courtItems.map((aol: string) => JSON.parse(aol))
          : [JSON.parse(courtItems)] : []
    } : {
      // If the radio button is set to anything else but yes, set the fields of law to be empty
      areas_of_law: [],
      courts: []
    };
  }

  private convertCourtAddressToApiAddressType(courtAddress: DisplayAddress): CourtAddress {
    return {
      'type_id': courtAddress.type_id,
      'description': courtAddress.description,
      'description_cy': courtAddress.description_cy,
      'address_lines': courtAddress.address_lines?.trim().split(/\r?\n/),
      'address_lines_cy': courtAddress.address_lines_cy?.trim().split(/\r?\n/),
      town: courtAddress.town?.trim(),
      'town_cy': courtAddress.town_cy?.trim(),
      'county_id': courtAddress.county_id,
      postcode: courtAddress.postcode?.trim().toUpperCase(),
      epim_id: courtAddress.epim_id?.trim().toUpperCase(),
      fields_of_law: courtAddress.fields_of_law
    };
  }

  private convertApiAddressToCourtAddressType(address: CourtAddress, areasOfLaw: AreaOfLaw[],
    courtTypes: CourtType[], dataPrefix: string): DisplayAddress {
    return {
      'type_id': address.type_id,
      'description': address.description,
      'description_cy': address.description_cy,
      'address_lines':
        address.address_lines ?
          typeof address.address_lines === 'string' ? (address.address_lines as string).split('\n').join('\n')
            : address.address_lines?.join('\n')
          : '',
      'address_lines_cy':
        address.address_lines_cy ?
          typeof address.address_lines_cy === 'string' ? (address.address_lines_cy as string).split('\n').join('\n')
            : address.address_lines_cy?.join('\n')
          : '',
      town: address.town?.trim(),
      'town_cy': address.town_cy?.trim(),
      'county_id': address.county_id,
      postcode: address.postcode?.trim().toUpperCase(),
      epim_id: address.epim_id?.trim().toUpperCase(),
      secondaryFieldsOfLawRadio: address.secondaryFieldsOfLawRadio,
      fields_of_law: {
        areas_of_law: address.fields_of_law?.areas_of_law
          ? this.mapAreaOfLawToRadioItem(areasOfLaw, address.fields_of_law.areas_of_law, dataPrefix) : [],
        courts: address.fields_of_law?.courts
          ? this.mapCourtTypeToRadioItem(courtTypes, address.fields_of_law.courts, dataPrefix) : [],
      }
    };
  }

  private checkAddressesAreUnique(addresses: DisplayCourtAddresses) : string[]{

    const errors: string[] = [];

    const primaryAddressLines: string[] = removeSpecialCharacters(addresses.primary.address_lines.split(/\r?\n/));
    const secondaryAddress1Lines: string[] = removeSpecialCharacters(addresses.secondary[0].address_lines.split(/\r?\n/));
    const secondaryAddress2Lines: string[] = removeSpecialCharacters(addresses.secondary[1].address_lines.split(/\r?\n/));

    if ((compareAddressLines(primaryAddressLines, secondaryAddress1Lines) &&  addresses.primary.postcode.toLowerCase() === addresses.secondary[0].postcode.toLowerCase())
      || (!!addresses.secondary[1].address_lines?.trim() && !!addresses.secondary[1].postcode?.trim() && compareAddressLines(primaryAddressLines, secondaryAddress2Lines) && addresses.primary.postcode.toLowerCase() === addresses.secondary[1].postcode.toLowerCase())
      || (!!addresses.secondary[0].address_lines?.trim() && !!addresses.secondary[0].postcode?.trim() && compareAddressLines(secondaryAddress1Lines, secondaryAddress2Lines) && addresses.secondary[0].postcode.toLowerCase() === addresses.secondary[1].postcode.toLowerCase())) {
      errors.push(this.duplicateAddressError);
    }

    const primaryWelshAddressLines: string[] = removeSpecialCharacters(addresses.primary.address_lines_cy.split(/\r?\n/));
    const secondaryWelshAddress1Lines: string[] = removeSpecialCharacters(addresses.secondary[0].address_lines_cy.split(/\r?\n/));
    const secondaryWelshAddress2Lines: string[] = removeSpecialCharacters(addresses.secondary[1].address_lines_cy.split(/\r?\n/));

    if (!!addresses.primary.address_lines_cy?.trim() && (compareAddressLines(primaryWelshAddressLines, secondaryWelshAddress1Lines) && addresses.primary.postcode.toLowerCase() === addresses.secondary[0].postcode.toLowerCase())
      || (!!addresses.secondary[1].address_lines_cy?.trim() && !!addresses.secondary[1].postcode?.trim() && compareAddressLines(primaryWelshAddressLines, secondaryWelshAddress2Lines) && addresses.primary.postcode.toLowerCase() === addresses.secondary[1].postcode.toLowerCase())
      || (!!addresses.secondary[0].address_lines_cy?.trim() && !!addresses.secondary[0].postcode?.trim() && compareAddressLines(secondaryWelshAddress1Lines, secondaryWelshAddress2Lines) && addresses.secondary[0].postcode.toLowerCase() === addresses.secondary[1].postcode.toLowerCase())) {
      errors.push(this.dupilcateWelshAddressError);
    }
    return errors;
  }

}
