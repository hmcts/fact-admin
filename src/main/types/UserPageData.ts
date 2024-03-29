import {User} from "./User";
import {Error} from "./Error";

export interface UserPageData {
  isSuperAdmin: boolean,
  csrfToken: string
}

export interface PasswordPageData {
  errors: Error[],
  user : string
}

export interface AddUserPageData {
  errors: Error[],
  updated: Boolean,
  userEmail: string,
  user: User
}

export interface SearchUserPageData {
  userEmail: string,
  errors: Error[],
  updated: Boolean,
  userRolesRemoved: Boolean
}

export interface SearchUserInvitePageData extends SearchUserPageData {
  userExists: Boolean
}

export interface EditUserPageData {
  errors: Error[],
  user: User
}
