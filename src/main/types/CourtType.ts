import {DxCode} from "./DxCode";

export interface CourtType {
  id: number,
  name?: string,
  code: number
}

export interface CourtTypePageData {
  errorMsg: string,
  updated: boolean,
  courtTypes: CourtTypeItem[],
  gbs? : string,
  dxCodes?: DxCode[];
}

export interface CourtTypeItem {
  value: string,
  text: string,
  magistrate: boolean,
  county: boolean,
  crown: boolean,
  checked: boolean,
  code: number
}
