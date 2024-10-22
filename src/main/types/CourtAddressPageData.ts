import {SelectItem} from "./CourtPageData";
import {DisplayCourtAddresses} from "./CourtAddress";

export class CourtAddressPageData {
  addressTypesPrimary: SelectItem[];
  addressTypesSecondary: SelectItem[];
  counties: SelectItem[];
  addresses: DisplayCourtAddresses;
  writeToUsTypeId: number;
  errors: { text: string }[];
  fatalError: boolean;
  primaryPostcodeInvalid: boolean;
  secondaryPostcodeInvalid: boolean;
  thirdPostcodeInvalid: boolean;
  primaryEpimInvalid: boolean;
  secondaryEpimInvalid: boolean;
  thirdEpimInvalid: boolean;
  updated: boolean;
};
