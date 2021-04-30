import {SelectItem} from "./CourtPageData";

export interface OpeningTime {
  type_id: number,
  hours: string
}

export interface OpeningTimeData {
  opening_times: OpeningTime[],
  openingTimeTypes: SelectItem[],
  errorMsg: string,
  updated: boolean
}
