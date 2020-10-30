import { Logger } from '../../types/Logger';
import {AxiosError, AxiosInstance} from 'axios';

export class FactApi {

  constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger
  ) { }

  public getCourts(): Promise<unknown[]> {
    return this.axios
      .get('/courts/all')
      .then(results => results.data)
      .catch(this.errorHandler([]));
  }

  public getCourt(slug: string): Promise<{}> {
    return this.axios
      .get(`/courts/${slug}`)
      .then(results => results.data)
      .catch(this.errorHandler({}));
  }

  public updateCourt(slug: string, body: {}): Promise<{}> {
    return this.axios
      .put(`/courts/${slug}`, body)
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
