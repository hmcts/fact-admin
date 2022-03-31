import {Error} from "./Error";
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
