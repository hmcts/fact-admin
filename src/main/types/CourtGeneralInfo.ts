export interface CourtGeneralInfo {
  name: string;
  open: boolean;
  access_scheme: boolean;
  info: string;
  info_cy: string;
  alert: string;
  alert_cy: string;
  in_person: boolean;
  service_centre: boolean;
  sc_intro_paragraph: string;
  sc_intro_paragraph_cy: string;
  common_platform: boolean;
}

export interface CourtGeneralInfoData {
  generalInfo: CourtGeneralInfo;
  errorMsg: string;
  updated: boolean;
  nameFieldError: string;
  fatalError: boolean;
}
