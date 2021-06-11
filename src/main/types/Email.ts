import {SelectItem} from "./CourtPageData";

export interface Email {
  adminEmailTypeId: number,
  explanation: string,
  explanationCy: string,
  address: string,
  isNew?: boolean
}

export interface EmailData {
  emails: Email[],
  emailTypes: SelectItem[],
  errorMsg: string,
  updated: boolean
}
