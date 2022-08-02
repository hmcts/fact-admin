import {AxiosError, AxiosInstance} from 'axios';
import {Logger} from '../../types/Logger';

export class FactApiBase {

  constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger
  ) { }

  public get<T>(url: string): Promise<T> {
    return this.axios
      .get(url)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public put<T,K>(url: string, obj: K, text?: boolean): Promise<T> {
    return this.axios
      .put(url,obj,  {
        headers: {
          'Content-Type': text? 'text/plain' : 'application/json'
        }})
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public post<T,K>(url: string, obj: K): Promise<T> {
    return this.axios
      .post(url,obj)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public delete<T,K>(url: string, obj?: K): Promise<T> {
    return this.axios
      .delete(url,obj)
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }
  public logError(err: AxiosError): void {
    this.logger.error(err.message);

    if (err.response) {
      this.logger.info(err.response.data);
      this.logger.info(err.response.headers);
    }
  }
}
