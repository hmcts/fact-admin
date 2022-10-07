import {OpeningTime} from '../../types/OpeningTime';
import {OpeningType} from '../../types/OpeningType';
import {EmailType} from '../../types/EmailType';
import {Email} from '../../types/Email';
import {CourtGeneralInfo} from '../../types/CourtGeneralInfo';
import {CourtType} from '../../types/CourtType';
import {ContactType} from '../../types/ContactType';
import {Contact} from '../../types/Contact';
import {LocalAuthority} from '../../types/LocalAuthority';
import {AreaOfLaw} from '../../types/AreaOfLaw';
import {AddressType, CourtAddress} from '../../types/CourtAddress';
import {Facility, FacilityType} from '../../types/Facility';
import {Audit} from '../../types/Audit';
import {CourtTypesAndCodes} from '../../types/CourtTypesAndCodes';
import {AdditionalLink} from '../../types/AdditionalLink';
import {Court} from '../../types/Court';
import {NewCourt} from '../../types/NewCourt';
import {SpoeAreaOfLaw} from '../../types/SpoeAreaOfLaw';
import {ApplicationProgression} from '../../types/ApplicationProgression';
import {ServiceArea} from '../../types/ServiceArea';
import {County} from '../../types/County';
import {FactApiBase} from './FactApiBase';
import {AxiosError, AxiosInstance} from 'axios';
import {Logger} from '../../types/Logger';
import {Region} from '../../types/Region';



export class FactApi extends FactApiBase {

  private readonly baseURL = '/courts';
  private readonly adminBaseUrl = '/admin/courts';
  private readonly adminUrl = '/admin';

  constructor(
    axios: AxiosInstance,
    logger: Logger
  ) {
    super(axios,logger);
  }

  public getCourts(): Promise<unknown[]> {
    return this.get<unknown[]>(`${this.baseURL}/all`)
      .catch(this.errorHandler([]));
  }

  public addCourt(newCourt: NewCourt): Promise<Court> {
    return this.post<Court,NewCourt>(`${this.baseURL}/`, newCourt);
  }

  public getAudits(page: number, size: number, location: string, email: string, dateFrom: string, dateTo: string): Promise<Audit[]> {
    return this.get<Audit[]>(`${this.adminUrl}/audit?page=${page}&size=${size}&location=${location}&email=${email}&dateFrom=${dateFrom}&dateTo=${dateTo}`);
  }

  public getPostcodes(slug: string): Promise<string[]> {
    return this.get<string[]>(`${this.adminBaseUrl}/${slug}/postcodes`);
  }

  public addPostcodes(slug: string, postcodes: string[]): Promise<string[]> {
    return this.post<string[],typeof postcodes>(`${this.adminBaseUrl}/${slug}/postcodes`, postcodes);
  }

  public deletePostcodes(slug: string, postcodes: string[]): Promise<string[]> {
    return this.delete<string[],unknown>(`${this.adminBaseUrl}/${slug}/postcodes`, {data: postcodes});
  }

  public movePostcodes(sourceSlug: string, destSlug: string, postcodes: string[]): Promise<string[]> {
    return this.put<string[],string[]>(`${this.adminBaseUrl}/${sourceSlug}/${destSlug}/postcodes`, postcodes);
  }

  public getDownloadCourts(): Promise<unknown[]> {
    return this.get<unknown[]>(`${this.baseURL}/`);
  }

  public getCourt(slug: string): Promise<unknown[]> {
    return this.get<unknown[]>(`${this.baseURL}/${slug}`);
  }

  public getGeneralInfo(slug: string): Promise<CourtGeneralInfo> {
    return this.get<CourtGeneralInfo>(`${this.adminBaseUrl}/${slug}/generalInfo`);
  }

  public updateGeneralInfo(slug: string, body: {}): Promise<CourtGeneralInfo> {
    return this.put<CourtGeneralInfo,typeof body>(`${this.adminBaseUrl}/${slug}/generalInfo`, body);
  }

  public getOpeningTimeTypes(): Promise<OpeningType[]> {
    return this.get<OpeningType[]>(`${this.adminUrl}/openingTypes`);
  }

  public getOpeningType(id: string): Promise<OpeningType> {
    return this.get<OpeningType>(`${this.adminUrl}/openingTypes/${id}`);
  }

  public createOpeningType(openingType: OpeningType): Promise<OpeningType>{
    return this.post<OpeningType,OpeningType>(`${this.adminUrl}/openingTypes`, openingType);
  }

  public updateOpeningType(openingType: OpeningType): Promise<OpeningType> {
    return this.put<OpeningType,OpeningType>(`${this.adminUrl}/openingTypes`, openingType);
  }

  public deleteOpeningType(id: string): Promise<number> {
    return this.delete<number,null>(`${this.adminUrl}/openingTypes/${id}`);
  }

  public getOpeningTimes(slug: string): Promise<OpeningTime[]> {
    return this.get<OpeningTime[]>(`${this.adminBaseUrl}/${slug}/openingTimes`);
  }

  public updateOpeningTimes(slug: string, body: OpeningTime[]): Promise<OpeningTime[]> {
    return this.put<OpeningTime[],typeof body>(`${this.adminBaseUrl}/${slug}/openingTimes`, body);
  }

  public getEmailTypes(): Promise<EmailType[]> {
    return this.get<EmailType[]>(`${this.adminBaseUrl}/emailTypes`);
  }

  public getEmails(slug: string): Promise<Email[]>  {
    return this.get<Email[]>(`${this.adminBaseUrl}/${slug}/emails`);
  }

  public updateEmails(slug: string, body: Email[]): Promise<Email[]> {
    return this.put<Email[], typeof body>(`${this.adminBaseUrl}/${slug}/emails`, body);
  }

  public getContactTypes(): Promise<ContactType[]> {
    return this.get<ContactType[]>(`${this.adminUrl}/contactTypes`);
  }

  public getContacts(slug: string): Promise<Contact[]> {
    return this.get<Contact[]>(`${this.adminBaseUrl}/${slug}/contacts`);
  }

  public updateContacts(slug: string, body: Contact[]): Promise<Contact[]>{
    return this.put<Contact[],typeof body>(`${this.adminBaseUrl}/${slug}/contacts`, body);
  }

  public getCourtTypes(): Promise<CourtType[]>{
    return this.get<CourtType[]>(`${this.adminBaseUrl}/courtTypes`);
  }

  public getCourtTypesAndCodes(slug: string): Promise<CourtTypesAndCodes>{
    return this.get<CourtTypesAndCodes>(`${this.adminBaseUrl}/${slug}/courtTypesAndCodes`);
  }

  public updateCourtTypesAndCodes(slug: string, body: CourtTypesAndCodes): Promise<CourtTypesAndCodes> {
    return this.put<CourtTypesAndCodes,typeof body>(`${this.adminBaseUrl}/${slug}/courtTypesAndCodes`, body);
  }

  public getAllAreasOfLaw(): Promise<AreaOfLaw[]> {
    return this.get<AreaOfLaw[]>(`${this.adminUrl}/areasOfLaw`); // bankrupty, housing, money claims
  }

  public getAllServiceAreas(): Promise<ServiceArea[]>{
    return this.get<ServiceArea[]>(`${this.adminUrl}/serviceAreas`);
  }

  public getCourtAreasOfLaw(slug: string): Promise<AreaOfLaw[]>{
    return this.get<AreaOfLaw[]>(`${this.adminBaseUrl}/${slug}/courtAreasOfLaw`);
  }

  public updateCourtAreasOfLaw(slug: string, body: AreaOfLaw[]): Promise<AreaOfLaw[]> {
    return this.put<AreaOfLaw[], typeof body>(`${this.adminBaseUrl}/${slug}/courtAreasOfLaw`, body);
  }

  public getAllFacilityTypes(): Promise<FacilityType[]>{
    return this.get<FacilityType[]>(`${this.adminUrl}/facilities`);
  }

  public getCourtFacilities(slug: string): Promise<Facility[]> {
    return this.get<Facility[]>(`${this.adminBaseUrl}/${slug}/facilities`);
  }

  public updateCourtFacilities(slug: string, body: Facility[]): Promise<Facility[]> {
    return this.put<Facility[],typeof body>(`${this.adminBaseUrl}/${slug}/facilities`, body);
  }

  public getAllLocalAuthorities(): Promise<LocalAuthority[]>{
    return this.get<LocalAuthority[]>(`${this.adminUrl}/localauthorities/all`);
  }

  public updateLocalAuthority(id: number, name: string): Promise<LocalAuthority>{
    return this.put<LocalAuthority, typeof name>(`${this.adminUrl}/localauthorities/${id}`, name, true);
  }

  public getCourtLocalAuthoritiesByAreaOfLaw(slug: string, areaOfLaw: string): Promise<LocalAuthority[]> {
    return this.get<LocalAuthority[]>(`${this.adminBaseUrl}/${slug}/${areaOfLaw}/localAuthorities`);
  }

  public updateCourtLocalAuthoritiesByAreaOfLaw(slug: string, areaOfLaw: string, body: LocalAuthority[]): Promise<LocalAuthority[]> {
    return this.put<LocalAuthority[], typeof body>(`${this.adminBaseUrl}/${slug}/${areaOfLaw}/localAuthorities`, body);
  }

  public getCourtAddresses(slug: string): Promise<CourtAddress[]> {
    return this.get<CourtAddress[]>(`${this.adminBaseUrl}/${slug}/addresses`);
  }

  public updateCourtAddresses(slug: string, body: CourtAddress[]): Promise<CourtAddress[]> {
    return this.put<CourtAddress[], typeof body>(`${this.adminBaseUrl}/${slug}/addresses`, body);
  }

  public getAddressTypes(): Promise<AddressType[]> {
    return this.get<AddressType[]>(`${this.adminUrl}/addressTypes`);
  }

  public getCourtAdditionalLinks(slug: string): Promise<AdditionalLink[]> {
    return this.get<AdditionalLink[]>(`${this.adminBaseUrl}/${slug}/additionalLinks`);
  }

  public updateCourtAdditionalLinks(slug: string, body: AdditionalLink[]): Promise<AdditionalLink[]> {
    return this.put<AdditionalLink[], typeof body>(`${this.adminBaseUrl}/${slug}/additionalLinks`, body);
  }

  public getAreasOfLaw(): Promise<AreaOfLaw[]> {
    return this.get<AreaOfLaw[]>(`${this.adminUrl}/areasOfLaw`);
  }

  public getAreaOfLaw(id: string): Promise<AreaOfLaw> {
    return this.get<AreaOfLaw>(`${this.adminUrl}/areasOfLaw/${id}`);
  }

  public createAreaOfLaw(areaOfLaw: AreaOfLaw): Promise<AreaOfLaw> {
    return this.post<AreaOfLaw,AreaOfLaw>(`${this.adminUrl}/areasOfLaw`, areaOfLaw);
  }

  public updateAreaOfLaw(areaOfLaw: AreaOfLaw): Promise<AreaOfLaw> {
    return this.put<AreaOfLaw,AreaOfLaw>(`${this.adminUrl}/areasOfLaw`, areaOfLaw);
  }

  public deleteAreaOfLaw(id: string): Promise<void> {
    return this.delete<void,null>(`${this.adminUrl}/areasOfLaw/${id}`);
  }

  public getContactType(id: string): Promise<ContactType> {
    return this.get<ContactType>(`${this.adminUrl}/contactTypes/${id}`);
  }

  public createContactType(contactType: ContactType): Promise<ContactType> {
    return this.post<ContactType,ContactType>(`${this.adminUrl}/contactTypes`, contactType);
  }

  public updateContactType(contactType: ContactType): Promise<ContactType> {
    return this.put<ContactType,ContactType>(`${this.adminUrl}/contactTypes`, contactType);
  }

  public deleteContactType(id: string): Promise<void> {
    return this.delete<void,null>(`${this.adminUrl}/contactTypes/${id}`);
  }


  public getCourtImage(slug: string): Promise<string> {
    return this.get<string>(`${this.baseURL}/${slug}/courtPhoto`);
  }

  public updateCourtImage(slug: string, body: {}): Promise<string> {
    return this.put<string,typeof body>(`${this.baseURL}/${slug}/courtPhoto`, body);
  }

  public getAllSpoeAreasOfLaw(): Promise<SpoeAreaOfLaw[]> {
    return this.get<SpoeAreaOfLaw[]>(`${this.adminBaseUrl}/SpoeAreasOfLaw`);
  }

  public getCourtSpoeAreasOfLaw(slug: string): Promise<SpoeAreaOfLaw[]> {
    return this.get<SpoeAreaOfLaw[]>(`${this.adminBaseUrl}/${slug}/SpoeAreasOfLaw`);
  }

  public updateCourtSpoeAreasOfLaw(slug: string, body: SpoeAreaOfLaw[]): Promise<SpoeAreaOfLaw[]> {
    return this.put<SpoeAreaOfLaw[],typeof body>(`${this.adminBaseUrl}/${slug}/SpoeAreasOfLaw`, body);
  }

  public getFacilityTypes(): Promise<FacilityType[]> {
    return this.get<FacilityType[]>(`${this.adminUrl}/facilities`);
  }

  public getFacilityType(id: string): Promise<FacilityType> {
    return this.get<FacilityType>(`${this.adminUrl}/facilities/${id}`);
  }

  public createFacilityType(facilityType: FacilityType): Promise<FacilityType> {
    return this.post<FacilityType,FacilityType>(`${this.adminUrl}/facilities`, facilityType);
  }

  public updateFacilityType(facilityType: FacilityType): Promise<FacilityType> {
    return this.put<FacilityType,FacilityType>(`${this.adminUrl}/facilities`, facilityType);
  }

  public deleteFacilityType(id: string): Promise<number> {
    return this.delete<number,null>(`${this.adminUrl}/facilities/${id}`);
  }

  public reorderFacilityTypes(ids: string[]): Promise<FacilityType[]> {
    return this.put<FacilityType[],typeof ids>(`${this.adminUrl}/facilities/reorder`, ids);
  }

  public getCounties(): Promise<County[]> {
    return this.get<County[]>(`${this.adminUrl}/counties`);
  }

  public getApplicationUpdates(slug: string): Promise<ApplicationProgression[]> {
    return this.get<ApplicationProgression[]>(`${this.adminBaseUrl}/${slug}/application-progression`);
  }

  public updateApplicationUpdates(slug: string, body: ApplicationProgression[]): Promise<ApplicationProgression[]> {
    return this.put<ApplicationProgression[],typeof body>(`${this.adminBaseUrl}/${slug}/application-progression`, body);
  }

  public async updateCourtsInfo(body: UpdateCourtsInfoRequest): Promise<void> {
    return this.put<void,typeof body>(`${this.baseURL}/info`, body);
  }

  public getRegions(): Promise<Region[]> {
    return this.get<Region[]>(`${this.adminUrl}/regions`);
  }

  private errorHandler<T>(defaultValue: T) {
    return (err: AxiosError) => {
      this.logError(err);

      return defaultValue;
    };
  }
}

interface UpdateCourtsInfoRequest {
  'info': string;
  'info_cy': string;
  'courts': string[];
}



