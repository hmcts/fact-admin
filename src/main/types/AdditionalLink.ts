import {Element} from "./Element";
import {Error} from "./Error";

export interface AdditionalLink extends Element {
  url: string,
  display_name: string,
  display_name_cy: string
}

export interface AdditionalLinkData {
  links: AdditionalLink[],
  errors: Error[],
  updated: boolean,
  fatalError: boolean,
}
