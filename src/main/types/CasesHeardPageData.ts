import {AreaOfLaw} from "./AreaOfLaw";
import {Error} from "./Error";

export interface CasesHeardPageData {
  allAreasOfLaw: AreaOfLaw[],
  courtAreasOfLaw: AreaOfLaw[],
  errorMsg: Error[],
  updated: Boolean
}
