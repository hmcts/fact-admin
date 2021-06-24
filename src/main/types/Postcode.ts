import {Error} from "./Error";

export interface PostcodeData {
  postcodes: string[],
  slug: string,
  errors: Error[],
  updated: boolean,
  searchValue: string
}
