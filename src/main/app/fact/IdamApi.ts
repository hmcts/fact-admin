import config from 'config';
import {AxiosError, AxiosInstance} from 'axios';
import {Logger} from '../../types/Logger';
import {User} from '../../types/User';
import autobind from 'autobind-decorator';

@autobind
export class IdamApi {

  private readonly addUserURL: string = config.get('services.idam.addNewUserURL');
  private readonly userURL: string = config.get('services.idam.userURL');
  private readonly updateUserDetailsUserURL: string = config.get('services.idam.updateUserDetailsURL');

  constructor(
    private readonly axios: AxiosInstance,
    private readonly logger: Logger
  ) {}

  public registerUser(user: User, accessToken: string): Promise<User>{
    return this.axios
      .post(`${this.addUserURL}`, user, {
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
    return this.axios
      .get(`${this.userURL}?email=` + userEmail,  {
        baseURL: '',
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      })
      .then(results => results.data)
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public updateUserDetails(userId: string, forename: string, surname: string, accessToken: string): Promise<User>{
    return this.axios
      .patch(`${this.updateUserDetailsUserURL}` + userId,  {
        baseURL: '',
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
        body: {
          forename: forename,
          surname: surname
        }
      })
      .then(results => {
        console.log('RESULTS: ', results);
        return results.data;
      })
      .catch(err => {
        console.log('ERROR: ',err);
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public updateUserRole(userId: string, roleId: string, accessToken: string): Promise<User>{
    return this.axios
      .patch(`${this.userURL}` + userId + '/roles/' + roleId,  {
        baseURL: '',
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      })
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

