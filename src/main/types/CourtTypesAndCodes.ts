import {DxCode} from "./DxCode";
import {CourtType} from "./CourtType";

export interface CourtTypesAndCodes {
  types: CourtType[];
  gbsCode?: string;
  dxCodes?: DxCode[];
}
