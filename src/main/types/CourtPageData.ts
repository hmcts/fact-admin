import {Court} from './Court';

export interface CourtPageData {
  isSuperAdmin: boolean,
  court: Court,
  updated: boolean
}

export interface SelectItem {
  value: any,
  text: string,
  selected: boolean
}
