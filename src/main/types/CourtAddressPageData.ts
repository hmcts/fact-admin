import {SelectItem} from "./CourtPageData";
import {DisplayCourtAddresses} from "./CourtAddress";

export class CourtAddressPageData {
  addressTypesPrimary: SelectItem[];
  addressTypesSecondary: SelectItem[];
  addressTypesThird: SelectItem[];
  addresses: DisplayCourtAddresses;
  writeToUsTypeId: number;
  errors: { text: string }[];
  fatalError: boolean;
  primaryPostcodeInvalid: boolean;
  secondaryPostcodeInvalid: boolean;
  thirdPostcodeInvalid: boolean;
  updated: boolean;
};
