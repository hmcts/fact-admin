import {Logger} from '../../types/Logger';
import {AxiosError, AxiosInstance} from 'axios';
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

export class FactApi {

  private readonly baseURL = '/courts';
  private readonly adminBaseUrl = '/admin/courts';

  constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger
  ) { }

  public getCourts(): Promise<unknown[]> {
    return this.axios
      .get(`${this.baseURL}/all`)
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public getPostcodes(slug: string): Promise<string[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/postcodes`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public addPostcodes(slug: string, postcodes: string[]): Promise<string[]> {
    return this.axios
      .post(`${this.adminBaseUrl}/${slug}/postcodes`, postcodes)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public deletePostcodes(slug: string, postcodes: string[]): Promise<string[]> {
    return this.axios
      .delete(`${this.adminBaseUrl}/${slug}/postcodes`, { data: postcodes })
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public movePostcodes(sourceSlug: string, destSlug: string, postcodes: string[]): Promise<string[]> {
    return this.axios
      .put(`${this.adminBaseUrl}/${sourceSlug}/${destSlug}/postcodes`, postcodes)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getDownloadCourts(): Promise<unknown[]> {
    return this.axios
      .get(`${this.baseURL}/`)
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public getCourt(slug: string): Promise<unknown[]> {
    return this.axios
      .get(`${this.baseURL}/${slug}`)
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public getGeneralInfo(slug: string): Promise<CourtGeneralInfo> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/generalInfo`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });  }


  public updateGeneralInfo(slug: string, body: {}): Promise<CourtGeneralInfo> {
    return this.axios
      .put(`${this.adminBaseUrl}/${slug}/generalInfo`, body)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });  }

  public getOpeningTimeTypes(): Promise<OpeningType[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/openingTypes`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });  }

  public getOpeningTimes(slug: string): Promise<OpeningTime[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/openingTimes`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });  }

  public updateOpeningTimes(slug: string, body: OpeningTime[]): Promise<OpeningTime[]> {
    return this.axios
      .put(`${this.adminBaseUrl}/${slug}/openingTimes`, body)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }


  public getEmailTypes(): Promise<EmailType[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/emailTypes`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });  }

  public getEmails(slug: string): Promise<Email[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/emails`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });  }

  public updateEmails(slug: string, body: Email[]): Promise<Email[]> {
    return this.axios
      .put(`${this.adminBaseUrl}/${slug}/emails`, body)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getContactTypes(): Promise<ContactType[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/contactTypes`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getContacts(slug: string): Promise<Contact[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/contacts`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public updateContacts(slug: string, body: Contact[]): Promise<Contact[]> {
    return this.axios
      .put(`${this.adminBaseUrl}/${slug}/contacts`, body)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getCourtTypes(): Promise<CourtType[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/courtTypes/all`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getCourtCourtTypes(slug: string): Promise<CourtType[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/courtTypes`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public updateCourtCourtTypes(slug: string, body: CourtType[]): Promise<CourtType[]> {
    return this.axios
      .put(`${this.adminBaseUrl}/${slug}/courtTypes`, body)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getCourtAreasOfLaw(slug: string): Promise<AreaOfLaw[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/courtAreasOfLaw`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getLocalAuthorities(): Promise<LocalAuthority[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/localAuthorities`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getCourtLocalAuthoritiesByAreaOfLaw(slug: string, areaOfLaw: string): Promise<LocalAuthority[]> {
    return this.axios
      .get(`${this.adminBaseUrl}/${slug}/${areaOfLaw}/localAuthorities`)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public updateCourtLocalAuthoritiesByAreaOfLaw(slug: string, areaOfLaw: string, body: LocalAuthority[]): Promise<LocalAuthority[]> {
    return this.axios
      .put(`${this.adminBaseUrl}/${slug}/${areaOfLaw}/localAuthorities`, body)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public async updateCourtsInfo(body: UpdateCourtsInfoRequest): Promise<void> {
    return this.axios.put(`${this.baseURL}/info`, body);
  }

  private errorHandler<T>(defaultValue: T) {
    return (err: AxiosError) => {
      this.logError(err);

      return defaultValue;
    };
  }

  private logError(err: AxiosError) {
    this.logger.error(err.message);

    if (err.response) {
      this.logger.info(err.response.data);
      this.logger.info(err.response.headers);
    }
  }
}

interface UpdateCourtsInfoRequest {
  'info': string,
  'info_cy': string,
  'courts': string[]
}
