import {Error} from "./Error";

export interface PhotoPageData {
  courtPhotoFileName: string,
  courtPhotoFileURL: string,
  slug: string,
  errorMsg: Error[],
  uploadError: string,
  updated: Boolean
}
