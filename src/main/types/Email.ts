import {SelectItem} from "./CourtPageData";
import {Error} from "./Error";
import {Element} from "./Element";

export interface Email extends Element {
  adminEmailTypeId: number,
  explanation: string,
  explanationCy: string,
  address: string,
  isInvalidFormat?: boolean
}

export interface EmailData {
  emails: Email[],
  emailTypes: SelectItem[],
  errors: Error[],
  updated: boolean
}
