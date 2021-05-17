import {SelectItem} from "./CourtPageData";

export interface Contact {
  type_id: number;
  number: string;
  fax: boolean;
  explanation: string;
  explanation_cy: string;
}

export interface ContactPageData {
  contacts: Contact[],
  contactTypes: SelectItem[],
  errorMsg: string,
  updated: boolean
}
