import {SelectItem} from "./CourtPageData";

export interface OpeningTime {
  type_id: number,
  hours: string,
  isNew?: boolean
}

export interface OpeningTimeData {
  opening_times: OpeningTime[],
  openingTimeTypes: SelectItem[],
  errorMsg: string,
  updated: boolean
}
