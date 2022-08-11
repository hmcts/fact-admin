import {Error} from "./Error";
import {Element} from "./Element";

export interface ApplicationProgression extends Element{
  type: string;
  type_cy: string;
  email: string;
  external_link: string;
  external_link_description: string;
  external_link_description_cy: string;
}

export interface ApplicationProgressionData {
  application_progression: ApplicationProgression[],
  isEnabled : boolean,
  errors: Error[],
  updated: boolean,
  fatalError: boolean,
}
