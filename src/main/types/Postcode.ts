import {Error} from "./Error";
import {Court} from "./Court";
import {CourtType} from "./CourtType";
import {AreaOfLaw} from "./AreaOfLaw";

export interface PostcodeData {
  postcodes: string[],
  courts: Court[],
  slug: string,
  errors: Error[],
  updated: boolean,
  searchValue: string,
  isEnabled : boolean,
  courtTypes: CourtType[],
  areasOfLaw: AreaOfLaw[]
}
