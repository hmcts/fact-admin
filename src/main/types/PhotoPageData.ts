import {Error} from "./Error";

export interface PhotoPageData {
  courtPhoto: string,
  slug: string,
  errorMsg: Error[],
  updated: Boolean
}
