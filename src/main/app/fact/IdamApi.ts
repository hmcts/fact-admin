import config from 'config';
import {AxiosError, AxiosInstance} from 'axios';
import {Logger} from '../../types/Logger';
import {User} from '../../types/User';
import autobind from 'autobind-decorator';

@autobind
export class IdamApi {

  private readonly addUser: string = config.get('services.idam.addNewUserURL');
  private readonly searchUser: string = config.get('services.idam.searchUserURL');

  constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger
  ) {}

  public registerUser(user: User, accessToken: string): Promise<User>{
    return this.axios
      .post(`${this.addUser}`, user, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }})
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public getUserByEmail(userEmail: string, accessToken: string): Promise<User>{
    console.log(config.get('services.idam.addNewUserURL'));
    console.log(config.get('services.idam.searchUserURL'));
    return this.axios
      .get(`${this.searchUser}`,  {
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
        params: {
          email: userEmail
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

