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
  id: number | string,
  value: string,
  text: string,
  checked?: boolean
}

export interface LocalAuthoritiesListPageData {
  errorMsg: string,
  updated: boolean,
  selected: LocalAuthority,
  updatedName: string,
  localAuthorities: LocalAuthorityItem[]

}
