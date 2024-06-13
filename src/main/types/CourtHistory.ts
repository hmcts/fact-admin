import {Element} from "./Element";
import {Error} from "./Error";

export interface CourtHistory extends Element {
  court_name: string,
  court_name_cy: string,
}

export interface CourtHistoryData {
  courtHistories: CourtHistory[],
  errors: Error[],
  updated: boolean,
  fatalError: boolean,
}
