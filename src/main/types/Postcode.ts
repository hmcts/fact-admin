import {Error} from "./Error";

export interface Postcode {
  postcode: string
}

export interface PostcodeData {
  postcodes: Postcode[],
  slug: string,
  errors: Error[]
}
