import {Error} from "./Error";

export interface PhotoPageData {
  courtPhotoFileName: string,
  slug: string,
  errorMsg: Error[],
  uploadError: string,
  updated: Boolean
}
