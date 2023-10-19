import {Element} from "./Element";
export interface User extends Element{
  id?: string,
  sub: string,
  forename: string,
  surname: string,
  active: boolean;
  locked: boolean;
  pending: boolean;
  stale: boolean;
  pwdAccountLockedTime?: string;
  ssoProvider: string;
  ssoId: string;
  lastModified: string;
  createDate: string;
  assignableRoles?: string[];
  multiFactorAuthentication?: boolean;
  jwt: jwtToken;
  isSuperAdmin: boolean;
  isViewer: boolean;
}

export interface jwtToken {
  roles: string[],
  sub: string
}
