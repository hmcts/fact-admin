import {Error} from "./Error";
import {Court} from "./Court";

export interface PostcodeData {
  postcodes: string[],
  courts: Court[],
  slug: string,
  errors: Error[],
  updated: boolean,
  searchValue: string,
  isEnabled : boolean
}
