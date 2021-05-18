


export interface CourtType {
  id: number,
  name: string,
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
  checked: boolean,
  code: number
}

