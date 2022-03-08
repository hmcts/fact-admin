import {Element} from "./Element";
export interface User extends Element{
  id?: string,
  email: string,
  forename: string,
  surname: string,
  roles: string[],
}

