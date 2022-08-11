import {SelectItem} from "./CourtPageData";
import {Element} from "./Element";
import {Error} from "./Error";

export interface FacilityType {
  id: number;
  name: string;
  nameCy?: string;
  order?: number;
  image?: string;
  imageDescription?: string;
  imageFilePath?: string;
}

export interface Facility extends Element {
  id : number;
  description: string;
  descriptionCy : string;
}

export interface FacilityPageData {
  errors: Error[],
  updated: boolean,
  facilitiesTypes: SelectItem[],
  courtFacilities: Facility[],
  requiresValidation: boolean,
  fatalError: boolean,
}
