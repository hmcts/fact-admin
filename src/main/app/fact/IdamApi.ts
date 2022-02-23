import config from 'config';
import {AxiosError, AxiosInstance, AxiosResponse} from 'axios';
import {Logger} from '../../types/Logger';
import {User} from '../../types/User';
import autobind from 'autobind-decorator';

@autobind
export class IdamApi {

  private readonly addUserURL: string = config.get('services.idam.addNewUserURL');
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
      .get(`${this.updateUserDetailsUserURL}`,{
        baseURL: '',
        headers: {
          Authorization: 'Bearer ' + accessToken
        },
        params: {query: `email:${userEmail}`}
      })
      .then(results => results.data[0])
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public updateUserDetails(userId: string, forename: string, surname: string, accessToken: string): Promise<User>{
    return this.axios
      .patch(`${this.updateUserDetailsUserURL}` + userId,  {
        forename: forename,
        surname: surname
      }, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      })
      .then(results => {
        return results.data;
      })
      .catch(err => {
        this.logError(err);
        return Promise.reject(err);
      });
  }

  public grantUserRole(userId: string, role: object, accessToken: string): Promise<AxiosResponse<any>>{
    return this.axios
      .post(`${this.updateUserDetailsUserURL}` + userId + '/roles/',  role,{
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

  public removeUserRole(userId: string, roleName: string, accessToken: string): Promise<AxiosResponse<any>>{
    return this.axios
      .delete(`${this.updateUserDetailsUserURL}` + userId + '/roles/' + roleName,{
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

  public deleteUser(userId: string, accessToken: string): Promise<AxiosResponse<any>>{
    return this.axios
      .delete(`${this.updateUserDetailsUserURL}` + userId,{
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

