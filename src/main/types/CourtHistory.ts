import {Element} from "./Element";
import {Error} from "./Error";

export interface CourtHistory extends Element {
  name: string,
  nameCy: string,
}

export interface CourtHistoryData {
  courtHistories: CourtHistory[],
  errors: Error[],
  updated: boolean,
  fatalError: boolean,
}
