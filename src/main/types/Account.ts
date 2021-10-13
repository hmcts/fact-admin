import {Element} from "./Element";
export interface Account extends Element{
  email: string,
  firstName: string,
  lastName: string,
  roles: string[],
}

