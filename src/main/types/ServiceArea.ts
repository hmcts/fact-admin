import {AreaOfLaw} from './AreaOfLaw';
import {ServiceAreaCourt} from './ServiceAreaCourt';

export interface ServiceArea {
  name: string,
  description: string,
  slug: string,
  serviceAreaType: string,
  onlineUrl: string,
  onlineText: string,
  areaOfLawName: AreaOfLaw,
  serviceAreaCourts: ServiceAreaCourt[],
  text: string
}
