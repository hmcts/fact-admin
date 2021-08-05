import {SelectItem} from "./CourtPageData";
import {Element} from "./Element";
import {Error} from "./Error";

export interface FacilityType {
  id: number,
  name: string,
}

export interface Facility extends Element{
  name : string;
  description: string;
  descriptionCy : string;

}

export interface FacilityPageData {
  errors: Error[],
  updated: boolean,
  facilitiesTypes: SelectItem[],
  courtFacilities: Facility[]
}
