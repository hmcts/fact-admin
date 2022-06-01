
export interface DisplayCourtAddresses {
  primary: DisplayAddress;
  secondary: DisplayAddress;
  third: DisplayAddress;
}

export interface DisplayAddress {
  type_id: number;
  description: string;
  description_cy: string;
  address_lines: string;
  address_lines_cy: string;
  town: string;
  town_cy: string;
  county_id: number;
  postcode: string;
}


export interface CourtAddress {
  type_id: number;
  description: string;
  description_cy: string;
  address_lines: string[];
  address_lines_cy: string[];
  town: string;
  town_cy: string;
  county_id: number;
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
  descriptionValid: boolean;
  errors: string[];
}
