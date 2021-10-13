import {Account} from "./Account";
import {Error} from "./Error";

export interface AccountPageData {
  isSuperAdmin: boolean,
  csrfToken: string
}

export interface PasswordPageData {
  errors: Error[],
  account : string
}

export interface AddUserPageData {
  errors: Error[],
  updated: Boolean,
  account: Account
}
