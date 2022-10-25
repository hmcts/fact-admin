export interface CourtItem {
  name: string,
  updatedAt: Date,
  displayed: boolean,
  slug: string
  visible: boolean,
  row: JQuery,
  region: string[]
  //address: CourtAddress
}
