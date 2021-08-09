
export interface DisplayCourtAddresses {
  primary: DisplayAddress;
  secondary: DisplayAddress
}

export interface DisplayAddress {
  type_id: number;
  address_lines: string;
  address_lines_cy: string;
  town: string;
  town_cy: string;
  postcode: string;
}

export interface CourtAddress {
  type_id: number;
  address_lines: string[];
  address_lines_cy: string[];
  town: string;
  town_cy: string;
  postcode: string;
}

export interface AddressType {
  id: number;
  name: string;
  name_cy: string;
}

export interface AddressValidationResult {
  addressValid: boolean;
  postcodeValid: boolean;
  errors: string[];
}
