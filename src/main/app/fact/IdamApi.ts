import config from "config";
import {AxiosError, AxiosInstance} from "axios";
import {Logger} from "../../types/Logger";
import {Account} from "../../types/Account";

export class IdamApi {

  private readonly addUser : string = config.get('services.idam.addNewUserURL');

  constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger
  ) {}

  public registerUser(account : Account, accessToken: string): Promise<Account>{
      return this.axios
        .post(`${this.addUser}`, account, {
          headers: {
            Authorization: 'Bearer ' + accessToken
          }})
        .then(results => results.data)
        .catch(err => {
          this.logError(err);
          return Promise.reject(err);
        });
    }

  private logError(err: AxiosError) {
      this.logger.error(err.message);

      if (err.response) {
        this.logger.info(err.response.data);
        this.logger.info(err.response.headers);
      }
    }
  }

