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

@autobind
export class AddressController {

  getAddressTypesError = 'A problem occurred when retrieving the court address types.';
  getAddressesError = 'A problem occurred when retrieving the court addresses.';
  updateAddressError = 'A problem occurred when saving the court addresses.';
  multipleVisitAddressError = 'Only one visit address is permitted.';
  typeRequiredError = 'Address Type is required.';
  addressRequiredError = 'Address is required.';
  townRequiredError = 'Town is required.';
  invalidPostcodeError = 'Postcode is invalid.';
  postcodeMissingError = 'Postcode is required.';
  postcodeNotFoundError = 'Postcode entered could not be found.';
  writeToUsAddressType = 'Write to us';
  visitOrContactUsAddressType = 'Visit or contact us';
  primaryAddressPrefix = 'Primary Address: ';
  secondaryAddressPrefix = 'Secondary Address: ';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const addresses: DisplayCourtAddresses = {
      primary: req.body.primary,
      secondary: req.body.secondary,
    };

    // Validate token
    if(!CSRF.verify(req.body._csrf)) {
      await this.render(req, res, false, addresses, [this.updateAddressError]);
      return;
    }

    // Validate addresses
    const writeToUsTypeId = req.body.writeToUsTypeId;
    const addressesValid = this.validateCourtAddresses(addresses, writeToUsTypeId);
    if (addressesValid.errors.length > 0) {
      await this.render(req, res, false, addresses, addressesValid.errors,
        !addressesValid.primaryPostcodeValid, !addressesValid.secondaryPostcodeValid);
      return;
    }

    // Post addresses to API if valid
    await req.scope.cradle.api.updateCourtAddresses(req.params.slug, this.convertToApiType(addresses))
      .then(async (addressList: CourtAddress[]) => await this.render(req, res, true, this.convertToDisplayAddresses(addressList)) )
      .catch(async (reason: AxiosError) => {
        if (reason.response.status === 400) {
          const postcodeValidation = this.checkErrorResponseForPostcodeErrors(reason, addresses);
          const errors = postcodeValidation.errors.length === 0
            ? [this.updateAddressError] // we've encountered a 400 for a reason other than postcodes
            : postcodeValidation.errors;
          await this.render(req, res, false, addresses, errors, postcodeValidation.primaryInvalid, postcodeValidation.secondaryInvalid);
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
    secondaryPostcodeInvalid = false) {

    const slug: string = req.params.slug as string;
    let fatalError = false;

    if (!addresses) {
      await req.scope.cradle.api.getCourtAddresses(slug)
        .then((addressList: CourtAddress[]) => addresses = this.convertToDisplayAddresses(addressList))
        .catch(() => {
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
    // We expect a 'write to us' address type and use this to ensure that if 2 addresses are entered,
    // at least one is of this type.
    const writeToUsTypes = addressTypes.filter(at => at.name.toLowerCase() === this.writeToUsAddressType.toLowerCase()).map(at => at.id);

    const pageData: CourtAddressPageData = {
      addressTypesPrimary: this.getAddressTypesForSelect(addressTypes, true),
      addressTypesSecondary: this.getAddressTypesForSelect(addressTypes, false),
      addresses: addresses,
      writeToUsTypeId: writeToUsTypes.length === 1 ? writeToUsTypes[0] : null,
      errors: errorMsgs.map(errorMsg => { return { text: errorMsg }; }),
      fatalError: fatalError,
      primaryPostcodeInvalid: primaryPostcodeInvalid,
      secondaryPostcodeInvalid: secondaryPostcodeInvalid,
      updated: updated
    };

    res.render('courts/tabs/addressesContent', pageData);
  }

  private validateCourtAddresses(addresses: DisplayCourtAddresses, writeToUsTypeId: number):
    { primaryPostcodeValid: boolean; secondaryPostcodeValid: boolean; errors: string[] } {

    const primaryValidationResult = this.validateCourtAddress(addresses.primary, true);
    const secondaryValidationResult = this.validateCourtAddress(addresses.secondary, false);
    const addressTypeErrors = this.validateNoMoreThanOneVisitAddress(addresses.primary, addresses.secondary, writeToUsTypeId);
    const allErrors = primaryValidationResult.errors.concat(secondaryValidationResult.errors).concat(addressTypeErrors);

    return {
      primaryPostcodeValid: primaryValidationResult.postcodeValid,
      secondaryPostcodeValid: secondaryValidationResult.postcodeValid,
      errors: allErrors
    };
  }

  private validateCourtAddress(address: DisplayAddress, isPrimaryAddress: boolean): AddressValidationResult {
    const typeErrors = this.validateAddressTypeExists(address, isPrimaryAddress);
    const addressErrors = this.validateAddressLines(address, isPrimaryAddress);
    const postcodeErrors = this.validatePostcode(address, isPrimaryAddress);
    const errorPrefix = isPrimaryAddress ? this.primaryAddressPrefix : this.secondaryAddressPrefix;

    return {
      postcodeValid: postcodeErrors.length === 0,
      addressValid: addressErrors.length === 0,
      errors: typeErrors.concat(addressErrors).concat(postcodeErrors).map(error => errorPrefix + error)
    };
  }

  private validateAddressTypeExists(address: DisplayAddress, isPrimaryAddress: boolean): string[] {
    if (isPrimaryAddress || (!!address.postcode || this.addressFieldsNotEmpty(address))) {
      return !address.type_id ? [this.typeRequiredError] : [];
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
      if(!address.town?.trim()) {
        errors.push(this.townRequiredError);
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

  private validateNoMoreThanOneVisitAddress(primary: DisplayAddress, secondary: DisplayAddress, writeToUsTypeId: number): string[] {
    return writeToUsTypeId && !!primary.type_id && !!secondary.type_id && // validate only if types selected in both addresses
    (this.addressFieldsNotEmpty(secondary) || secondary.postcode?.trim()) && // validate only if secondary has some fields entered
    (primary.type_id !== writeToUsTypeId && secondary.type_id !== writeToUsTypeId) // at least 1 write address should exist
      ? [this.multipleVisitAddressError]
      : [];
  }

  private addressFieldsNotEmpty(courtAddress: DisplayAddress): boolean {
    return !!courtAddress.address_lines?.trim() || !!courtAddress.address_lines_cy?.trim() ||
      !!courtAddress.town?.trim() || !!courtAddress.town_cy?.trim();
  }

  private getAddressTypesForSelect(addressTypes: AddressType[], isPrimaryAddress: boolean): SelectItem[] {
    const allAddressTypes = addressTypes.map((at: AddressType) => ({ value: at.id, text: at.name, selected: false }));

    return isPrimaryAddress
      ? allAddressTypes
      : allAddressTypes.filter(at => at.text.toLowerCase() !== this.visitOrContactUsAddressType.toLowerCase());
  }

  private checkErrorResponseForPostcodeErrors(error: AxiosError, addresses: DisplayCourtAddresses):
    { primaryInvalid: boolean; secondaryInvalid: boolean; errors: string[] } {

    let primaryPostcodeInvalid = false;
    let secondaryPostcodeInvalid = false;
    const errors: string[] = [];

    // We expect an array of invalid postcodes in the body of the response
    if (Array.isArray(error.response.data)) {
      const invalidPostcodes = error.response.data as string[];

      invalidPostcodes.forEach(invalidPostcode => {
        if (invalidPostcode === addresses.primary?.postcode) {
          primaryPostcodeInvalid = true;
          errors.push(this.primaryAddressPrefix + this.postcodeNotFoundError);
        } else if (invalidPostcode === addresses.secondary?.postcode) {
          secondaryPostcodeInvalid = true;
          errors.push(this.secondaryAddressPrefix + this.postcodeNotFoundError);
        }
      });
    }

    return { primaryInvalid: primaryPostcodeInvalid, secondaryInvalid: secondaryPostcodeInvalid, errors: errors };
  }

  private convertToDisplayAddresses(addresses: CourtAddress[]): DisplayCourtAddresses {
    const courtAddresses: DisplayCourtAddresses = { primary: null, secondary: null };
    if (addresses.length > 0) {
      courtAddresses.primary = this.convertApiAddressToCourtAddressType(addresses[0]);
    }
    if (addresses.length > 1) {
      courtAddresses.secondary = this.convertApiAddressToCourtAddressType(addresses[1]);
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
    return apiAddresses;
  }

  private convertCourtAddressToApiAddressType(courtAddress: DisplayAddress): CourtAddress {
    return {
      'type_id': courtAddress.type_id,
      'address_lines': courtAddress.address_lines?.trim().split(/\r?\n/),
      'address_lines_cy': courtAddress.address_lines_cy?.trim().split(/\r?\n/),
      town: courtAddress.town?.trim(),
      'town_cy': courtAddress.town_cy?.trim(),
      postcode: courtAddress.postcode?.trim().toUpperCase()
    };
  }

  private convertApiAddressToCourtAddressType(address: CourtAddress): DisplayAddress {
    return {
      'type_id': address.type_id,
      'address_lines': address.address_lines?.join('\n'),
      'address_lines_cy': address.address_lines_cy?.join('\n'),
      town: address.town?.trim(),
      'town_cy': address.town_cy?.trim(),
      postcode: address.postcode?.trim()
    };
  }
}
