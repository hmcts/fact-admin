//import {SelectItem} from "./CourtPageData";
import {Error} from "./Error";
//import {Email} from "./Email";
//import {Application} from "express";
import {Element} from "./Element";


export interface ApplicationProgression extends Element{
  type: string;
  email: string;
  external_link: string;
  external_link_description: string;
}

export interface ApplicationProgressionData {
  application_progression: ApplicationProgression[],
  errors: Error[],
  updated: boolean
}
