import {AreaOfLaw} from "./AreaOfLaw";
import {Error} from "./Error";

export interface CasesHeardPageData {
  allAreasOfLaw: AreaOfLaw[],
  courtAreasOfLaw: AreaOfLaw[],
  slug: string,
  errorMsg: Error[],
  updated: Boolean,
  fatalError: Boolean,
}
