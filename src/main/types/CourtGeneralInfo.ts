export interface CourtGeneralInfo {
  name: string;
  open: boolean;
  access_scheme: boolean;
  info: string;
  info_cy: string;
  alert: string;
  alert_cy: string;
  in_person: boolean;
}

export interface CourtGeneralInfoData {
  generalInfo: CourtGeneralInfo;
  errorMsg: string;
  updated: boolean;
  nameFieldError: string;
}
