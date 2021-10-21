import {Element} from "./Element";
export interface User extends Element{
  email: string,
  firstName: string,
  lastName: string,
  roles: string[],
}

