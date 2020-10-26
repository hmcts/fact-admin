import { Logger } from '../../types/Logger';
import { AxiosInstance } from 'axios';

export class FactApi {

  constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger
  ) { }

  public getCourts(): Promise<unknown[]> {
    return this.axios
      .get('/courts/all')
      .then(results => results.data)
      .catch(err => {
        this.logger.error(err);
        return [];
      });
  }
}
