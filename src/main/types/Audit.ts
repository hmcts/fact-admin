import {Court} from './Court';

export interface AuditPageData {
  audits: Audit[],
  courts: Court[],
  errorMsg: string,
  currentPage: number,
  searchOptions: {
    username: string,
    location: string,
    dateFrom: string,
    dateTo: string
  }
}

export interface Audit {
  id: number,
  action: Action,
  location: string,
  user_email: string,
  action_data_before: string,
  action_data_after: string,
  creation_time: string
}

export interface Action {
  id: number,
  name: string
}
