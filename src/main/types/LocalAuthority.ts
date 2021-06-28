import {SelectItem} from "./CourtPageData";


export interface LocalAuthority {
  id: number,
  name: string
}

export interface LocalAuthoritiesAreaOfLaw {
  errorMsg: string,
  updated: boolean,
  isEnabled : boolean,
  courtAreasOfLaw: SelectItem[],
}
export interface LocalAuthoritiesPageData {
  errorMsg: string,
  updated: boolean,
  selectedAreaOfLaw : string,
  courtAreasOfLaw: SelectItem[],
  localAuthoritiesItems: LocalAuthorityItem[]
}


export interface LocalAuthorityItem {
  id: number,
  value: string,
  text: string,
  checked: boolean
}
