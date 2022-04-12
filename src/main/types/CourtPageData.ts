export interface CourtPageData {
  isSuperAdmin: boolean,
  isServiceCentre: boolean,
  slug: string,
  name: string,
  csrfToken: string
}

export interface SelectItem {
  value: string | number,
  text: string,
  selected: boolean
}
