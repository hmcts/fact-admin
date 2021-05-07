import {Logger} from '../../types/Logger';
import {AxiosError, AxiosInstance} from 'axios';
import {OpeningTime} from '../../types/OpeningTime';
import {OpeningType} from '../../types/OpeningType';
import {EmailType} from '../../types/EmailType';
import {Email} from '../../types/Email';

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

  public getDownloadCourts(): Promise<unknown[]> {
    return this.axios
      .get(`${this.baseURL}/`)
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public getCourt(slug: string): Promise<unknown[]> {
    return this.axios
      .get(`${this.baseURL}/court/${slug}`)
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public getCourtGeneral(slug: string): Promise<{}> {
    return this.axios
      .get(`${this.baseURL}/${slug}/general`)
      .then(results => results.data)
      .catch(this.errorHandler({}));
  }

  public updateCourtGeneral(slug: string, body: {}): Promise<{}> {
    return this.axios
      .put(`${this.baseURL}/${slug}/general`, body)
      .then(results => results.data)
      .catch(this.errorHandler({}));
  }

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

  public async updateCourtsInfo(body: UpdateCourtsInfoRequest): Promise<void> {
    return this.axios.put(`${this.baseURL}/info`, body);
  }

  private errorHandler<T>(defaultValue: T) {
    return (err: AxiosError) => {
      this.logger.error(err.message);

      if (err.response) {
        this.logger.info(err.response.data);
        this.logger.info(err.response.headers);
      }

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
