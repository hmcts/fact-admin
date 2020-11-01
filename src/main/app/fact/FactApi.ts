import { Logger } from '../../types/Logger';
import {AxiosError, AxiosInstance} from 'axios';

export class FactApi {

  private readonly baseURL = '/admin/courts';

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

  public getCourt(slug: string): Promise<{}> {
    return this.axios
      .get(`${this.baseURL}/${slug}`)
      .then(results => results.data)
      .catch(this.errorHandler({}));
  }

  public updateCourt(slug: string, body: {}): Promise<{}> {
    return this.axios
      .put(`${this.baseURL}/${slug}`, body)
      .then(results => results.data)
      .catch(this.errorHandler({}));
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
