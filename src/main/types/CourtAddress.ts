export interface DisplayCourtAddresses {
  primary: DisplayAddress;
  secondary: DisplayAddress;
  third: DisplayAddress;
}

export interface DisplayAddress {
  type_id?: number;
  description?: string;
  description_cy?: string;
  address_lines?: string;
  address_lines_cy?: string;
  town?: string;
  town_cy?: string;
  county_id?: number;
  postcode?: string;
  fields_of_law?: FieldsOfLaw;
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
  fields_of_law?: FieldsOfLaw;
}

export interface FieldsOfLaw {
  areas_of_law?: any,
  courts?: any
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
