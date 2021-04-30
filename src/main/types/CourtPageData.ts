import {Court} from './Court';

export interface CourtPageData {
  isSuperAdmin: boolean,
  court: Court,
  updated: boolean
}

export interface SelectItem {
  value: string | number,
  text: string,
  selected: boolean
}
