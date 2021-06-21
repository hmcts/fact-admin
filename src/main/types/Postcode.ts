import {Error} from "./Error";

export interface PostcodeData {
  postcodes: string[],
  errors: Error[]
}
