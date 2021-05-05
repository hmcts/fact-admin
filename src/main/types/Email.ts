import {SelectItem} from "./CourtPageData";

export interface Email {
  admin_email_type_id: number,
  explanation: string
  explanation_cy: string
  address: string
}

export interface EmailData {
  emails: Email[],
  emailTypes: SelectItem[],
  errorMsg: string,
  updated: boolean
}
