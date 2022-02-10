import {Error} from "./Error";
import {SpoeAreaOfLaw} from "./SpoeAreaOfLaw";

export interface SpoeAreaOfLawPageData {
  allSpoeAreasOfLaw: SpoeAreaOfLaw[],
  courtSpoeAreasOfLaw: SpoeAreaOfLaw[],
  slug: string,
  errorMsg: Error[],
  updated: Boolean
}
