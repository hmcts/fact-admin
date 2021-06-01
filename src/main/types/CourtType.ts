


export interface CourtType {
  id: number,
  name?: string,
  code: number
}

export interface CourtTypePageData {
  errorMsg: string,
  updated: boolean,
  items: CourtTypeItem[]
}


export interface CourtTypeItem {
  value: string,
  text: string,
  magistrate: boolean,
  county: boolean,
  crown: boolean,
  checked: boolean,
  code: number
}

