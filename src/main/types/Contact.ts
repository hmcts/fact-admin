import {SelectItem} from "./CourtPageData";
import {Element} from "./Element";
import {Error} from "./Error";

export interface Contact extends Element {
  type_id: number;
  number: string;
  fax: boolean;
  explanation: string;
  explanation_cy: string;
}

export interface ContactPageData {
  contacts: Contact[],
  contactTypes: SelectItem[],
  errors: Error[],
  updated: boolean,
  fatalError: boolean,
}
