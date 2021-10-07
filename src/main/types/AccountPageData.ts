import {Account} from "./Account";
import {Error} from "./Error";

export interface AccountPageData {
  isSuperAdmin: boolean,
  csrfToken: string
}


export interface AddUserPageData {
  errors: Error[],
  updated: Boolean
  isSuperAdmin: boolean,
  csrfToken: string,
  account: Account
}
