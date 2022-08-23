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
  DisplayCourtAddresses
} from '../../../types/CourtAddress';
import {CourtAddressPageData} from '../../../types/CourtAddressPageData';
import {SelectItem} from '../../../types/CourtPageData';
import {postcodeIsValidFormat} from '../../../utils/validation';
import {County} from '../../../types/County';
import {AreaOfLaw} from "../../../types/AreaOfLaw";
import {RadioItem} from "../../../types/RadioItem";
import {CourtType} from "../../../types/CourtType";

@autobind
export class AddressController {

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
  postcodeMissingError = 'Postcode is required.';
  postcodeNotFoundError = 'Postcode entered could not be found.';
  writeToUsAddressType = 'Write to us';
  visitOrContactUsAddressType = 'Visit or contact us';
  primaryAddressPrefix = 'Primary Address: ';
  secondaryAddressPrefix = 'Secondary Address 1: ';
  thirdAddressPrefix = 'Secondary Address 2: ';
  descriptionTooLongError = 'Maximum length of description is 100 characters';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const addresses: DisplayCourtAddresses = {
      primary: req.body.primary,
      secondary: req.body.secondary,
      third: req.body.third
    };

    // Validate token
    if (!CSRF.verify(req.body._csrf)) {
      await this.render(req, res, false, addresses, [this.updateAddressError]);
      return;
    }

    // Validate addresses
    const writeToUsTypeId = req.body.writeToUsTypeId;
    const addressesValid = this.validateCourtAddresses(addresses, writeToUsTypeId);
    if (addressesValid.errors.length > 0) {
      await this.render(req, res, false, addresses, addressesValid.errors,
        !addressesValid.primaryPostcodeValid, !addressesValid.secondaryPostcodeValid, !addressesValid.thirdPostcodeValid);
      return;
    }

    // Post addresses to API if valid
    await req.scope.cradle.api.updateCourtAddresses(req.params.slug, this.convertToApiType(addresses))
      .then(async (addressList: CourtAddress[]) => {

        // TODO:
        await this.render(req, res, true, this.convertToDisplayAddresses(addressList, await req.scope.cradle.api.getAllAreasOfLaw()
            .then((results: AreaOfLaw[]) => {
              return results
            })
            .catch(() => {
              // TODO: add error
            }),
          []))
      })
      .catch(async (reason: AxiosError) => {
        if (reason.response.status === 400) {
          const postcodeValidation = this.checkErrorResponseForPostcodeErrors(reason, addresses);
          const errors = postcodeValidation.errors.length === 0
            ? [this.updateAddressError] // we've encountered a 400 for a reason other than postcodes
            : postcodeValidation.errors;
          await this.render(req, res, false, addresses, errors, postcodeValidation.primaryInvalid, postcodeValidation.secondaryInvalid, postcodeValidation.thirdInvalid);
        } else {
          await this.render(req, res, false, addresses, [this.updateAddressError]);
        }
      });
  }

  private async render(
    req: AuthedRequest,
    res: Response,
    updated = false,
    addresses: DisplayCourtAddresses = null,
    errorMsgs: string[] = [],
    primaryPostcodeInvalid = false,
    secondaryPostcodeInvalid = false,
    thirdPostcodeInvalid = false) {

    const slug: string = req.params.slug as string;
    let fatalError = false;

    if (!addresses) {
      // Get the addresses and also keep the list for later so we can determine which
      // court types are selected further down
      const areasOfLaw = await req.scope.cradle.api.getAllAreasOfLaw()
        .then((results: AreaOfLaw[]) => {
          return results
        })
        .catch(() => {
          // TODO: change mssage to use one above
          errorMsgs.push('Cannot get areas of law');
          fatalError = true;
        });

      const courtTypes = await req.scope.cradle.api.getCourtTypes()
        .then((results: CourtType[]) => {
          return results
        })
        .catch(() => {
          // TODO: change mssage
          errorMsgs.push('Cannot get areas of law');
          fatalError = true;
        });

      await req.scope.cradle.api.getCourtAddresses(slug)
        .then((addressList: CourtAddress[]) =>
          addresses = this.convertToDisplayAddresses(addressList, areasOfLaw, courtTypes))
        .catch(() => {
          errorMsgs.push(this.getAddressesError);
          fatalError = true;
        });
    }

    // Add court types and areas of law, so they can be added to the court types dropdown

    // Court types = array of courts
    // Areas of law = array of areas of law
    // Both to be added to seperate lists or together? Prob separate...based on the question

    // To show values in those lists...
    // create an array of SelectItems for both, that include an attributes list as well?
    // when it gets passed back into the put, create a list of areas of law/court types based on the info

    console.log('before')
    // TODO: get complete list for all three for each, with values selected if there as true
    console.log(addresses.primary);
    console.log(addresses.secondary);
    console.log(addresses.third);

    console.log('primary')
    console.log(addresses.primary.fields_of_law);

    console.log('secondary')
    console.log(addresses.secondary.fields_of_law);

    console.log('third')
    console.log(addresses.third.fields_of_law);

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
      addressTypesThird: this.getAddressTypesForSelect(addressTypes, false),
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
      updated: updated
    };

    res.render('courts/tabs/addressesContent', pageData);
  }

  private mapAreaOfLawToRadioItem(allAreasOfLaw: AreaOfLaw[], courtAreasOfLaw: RadioItem[]): RadioItem[] {

    if (courtAreasOfLaw) {

      const areaOfLawItems = allAreasOfLaw.map((aol: AreaOfLaw) => (
        {
          id: aol.id,
          value: JSON.stringify(aol),
          text: aol.name,
          checked: courtAreasOfLaw.some(e => e.id === aol.id)
        }));

      return areaOfLawItems.sort((a, b) => (a.text < b.text ? -1 : 1));
    } else {
      return [];
    }
  }

  private mapCourtTypeToRadioItem(allCourtTypes: CourtType[], courtType: RadioItem[]): RadioItem[] {

    if (allCourtTypes) {

      const courtTypeItems = allCourtTypes.map((aol: CourtType) => (
        {
          id: aol.id,
          value: JSON.stringify(aol),
          text: aol.name,
          checked: courtType.some(e => e.id === aol.id)
        }));

      return courtTypeItems.sort((a, b) => (a.text < b.text ? -1 : 1));
    } else {
      return [];
    }
  }

  private validateCourtAddresses(addresses: DisplayCourtAddresses, writeToUsTypeId: number):
    { primaryPostcodeValid: boolean; secondaryPostcodeValid: boolean; thirdPostcodeValid: boolean; errors: string[] } {

    const primaryValidationResult = this.validateCourtAddress(addresses.primary, true, false);
    const secondaryValidationResult = this.validateCourtAddress(addresses.secondary, false, true);
    const thirdValidationResult = this.validateCourtAddress(addresses.third, false, false);
    const addressTypeErrors = this.validateNoMoreThanOneVisitAddress([addresses.primary, addresses.secondary, addresses.third], writeToUsTypeId);
    const allErrors = primaryValidationResult.errors.concat(secondaryValidationResult.errors).concat(addressTypeErrors).concat(thirdValidationResult.errors);

    return {
      primaryPostcodeValid: primaryValidationResult.postcodeValid,
      secondaryPostcodeValid: secondaryValidationResult.postcodeValid,
      thirdPostcodeValid: thirdValidationResult.postcodeValid,
      errors: allErrors
    };
  }

  private validateCourtAddress(address: DisplayAddress, isPrimaryAddress: boolean, isSecondaryAddress: boolean): AddressValidationResult {
    const typeErrors = this.validateAddressTypeExists(address, isPrimaryAddress);
    const countyErrors = this.validateCountyExists(address);
    const addressErrors = this.validateAddressLines(address, isPrimaryAddress);
    const postcodeErrors = this.validatePostcode(address, isPrimaryAddress);
    const descriptionErrors = this.validateDescriptionLength(address, isPrimaryAddress);
    const errorPrefix = isPrimaryAddress ? this.primaryAddressPrefix : (isSecondaryAddress ? this.secondaryAddressPrefix : this.thirdAddressPrefix);

    return {
      postcodeValid: postcodeErrors.length === 0,
      addressValid: addressErrors.length === 0,
      descriptionValid: descriptionErrors.length === 0,
      errors: typeErrors.concat(countyErrors).concat(addressErrors).concat(postcodeErrors).concat(descriptionErrors).map(error => errorPrefix + error)
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

  private validateDescriptionLength(address: DisplayAddress, isPrimaryAddress: boolean): string[] {
    const errors: string[] = [];
    if (!isPrimaryAddress) {
      if (!(address.description?.trim().length < 100) || !(address.description_cy.trim().length < 100)) {
        errors.push(this.descriptionTooLongError);
      }
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
    if (Array.isArray(error.response.data)) {
      const invalidPostcodes = error.response.data as string[];

      invalidPostcodes.forEach(invalidPostcode => {
        if (!primaryPostcodeInvalid && invalidPostcode.toUpperCase() === addresses.primary?.postcode?.toUpperCase()) {
          primaryPostcodeInvalid = true;
          errors.push(this.primaryAddressPrefix + this.postcodeNotFoundError);
        }
        if (!secondaryPostcodeInvalid && invalidPostcode.toUpperCase() === addresses.secondary?.postcode?.toUpperCase()) {
          secondaryPostcodeInvalid = true;
          errors.push(this.secondaryAddressPrefix + this.postcodeNotFoundError);
        } else if (!thirdPostcodeInvalid && invalidPostcode.toUpperCase() === addresses.third?.postcode?.toUpperCase()) {
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
    const courtAddresses: DisplayCourtAddresses = {primary: null, secondary: null, third: null};
    if (addresses.length > 0) {
      courtAddresses.primary = this.convertApiAddressToCourtAddressType(addresses[0], areasOfLaw, courtTypes);
    }
    if (addresses.length > 1) {
      courtAddresses.secondary = this.convertApiAddressToCourtAddressType(addresses[1], areasOfLaw, courtTypes);
    }
    if (addresses.length > 2) {
      courtAddresses.third = this.convertApiAddressToCourtAddressType(addresses[2], areasOfLaw, courtTypes);
    }
    return courtAddresses;
  }

  private convertToApiType(courtAddresses: DisplayCourtAddresses): CourtAddress[] {
    const apiAddresses: CourtAddress[] = [];
    if (courtAddresses.primary) {
      apiAddresses.push(this.convertCourtAddressToApiAddressType(courtAddresses.primary));
    }
    if (courtAddresses.secondary && courtAddresses.secondary.type_id && courtAddresses.secondary.address_lines &&
      courtAddresses.secondary.town && courtAddresses.secondary.postcode) {
      apiAddresses.push(this.convertCourtAddressToApiAddressType(courtAddresses.secondary));
    }
    if (courtAddresses.third && courtAddresses.third.type_id && courtAddresses.third.address_lines &&
      courtAddresses.third.town && courtAddresses.third.postcode) {
      apiAddresses.push(this.convertCourtAddressToApiAddressType(courtAddresses.third));
    }
    return apiAddresses;
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

      // TODO: this will be the one going to the API, only get the ones with checked = true
      fields_of_law: courtAddress.fields_of_law
    };
  }

  private convertApiAddressToCourtAddressType(address: CourtAddress, areasOfLaw: AreaOfLaw[],
                                              courtTypes: CourtType[]): DisplayAddress {
    return {
      'type_id': address.type_id,
      'description': address.description,
      'description_cy': address.description_cy,
      'address_lines': address.address_lines?.join('\n'),
      'address_lines_cy': address.address_lines_cy?.join('\n'),
      town: address.town?.trim(),
      'town_cy': address.town_cy?.trim(),
      'county_id': address.county_id,
      postcode: address.postcode?.trim().toUpperCase(),
      fields_of_law: {
        areas_of_law: address.fields_of_law?.areas_of_law ? this.mapAreaOfLawToRadioItem(areasOfLaw, address.fields_of_law.areas_of_law) : [],
        courts: address.fields_of_law?.courts ? this.mapCourtTypeToRadioItem(courtTypes, address.fields_of_law.courts) : [],
      }
    };
  }
}
