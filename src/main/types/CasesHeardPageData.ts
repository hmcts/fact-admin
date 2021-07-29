import {AreaOfLaw} from "./AreaOfLaw";
import {Error} from "./Error";

export interface CasesHeardPageData {
  areasOfLaw: AreaOfLaw[],
  courtAreasOfLaw: AreaOfLaw[],
  errorMsg: Error[],
  updated: Boolean
}
