import { Logger } from '../../types/Logger';
import {AxiosError, AxiosInstance} from 'axios';
import {OpeningTime, OpeningType} from '../../types/OpeningTime';

export class FactApi {

  private readonly baseURL = '/courts';

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
      .get(`${this.baseURL}/openingTypes`)
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public getOpeningTimes(slug: string): Promise<OpeningTime[]> {
    return this.axios
      .get(`${this.baseURL}/${slug}/openingTimes`)
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public updateOpeningTimes(slug: string, body: OpeningTime[]): Promise<OpeningTime[]> {
    return this.axios
      .put(`${this.baseURL}/${slug}/openingTimes`, body)
      .then(results => results.data)
      .catch(err => {
        this.errorHandler([]);
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
}

interface UpdateCourtsInfoRequest {
  'info': string,
  'info_cy': string,
  'courts': string[]
}
