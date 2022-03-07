import {Element} from "./Element";
export interface User extends Element{
  email: string,
  forename: string,
  surname: string,
  roles: string[],
}

