import {SelectItem} from "./CourtPageData";
import {Error} from "./Error";
import {Element} from "./Element";

export interface OpeningTime extends Element {
  type_id: number,
  hours: string,
}

export interface OpeningTimeData {
  opening_times: OpeningTime[],
  openingTimeTypes: SelectItem[],
  errors: Error[],
  updated: boolean
}
