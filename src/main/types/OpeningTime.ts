import {SelectItem} from "./CourtPageData";
import {Error} from "./Error";

export interface OpeningTime {
  type_id: number,
  hours: string,
  isNew?: boolean,
  isDuplicated?: boolean
}

export interface OpeningTimeData {
  opening_times: OpeningTime[],
  openingTimeTypes: SelectItem[],
  errors: Error[],
  updated: boolean
}
