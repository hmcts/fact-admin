import {Court} from '../../../main/types/Court';
import axios, {AxiosInstance, AxiosResponse} from 'axios';
import { config as testConfig } from '../../config';
import config from 'config';
import {NewCourt} from '../../../main/types/NewCourt';
import {LocalAuthority} from '../../../main/types/LocalAuthority';

class FactApiHelper extends Helper {
  private axiosInstance: AxiosInstance;
  private readonly baseURL = '/courts/';
  private readonly adminBaseUrl = '/admin/courts/';
  // private readonly adminUrl = '/admin/';

  constructor(config: object) {
    super(config);
    this.initAxios();
  }

  private async getOIDCToken() {
    const { apiURL, clientID, clientSecret } = config.get('services.idam') as Record<string, string>;
    const { superUsername: username, password } = testConfig as unknown as Record<string, string>;

    try {
      return (await axios.post(
        apiURL + '/o/token',
        new URLSearchParams({
          'grant_type': 'password',
          username,
          password,
          client_id: clientID,
          client_secret: clientSecret,
          scope: 'openid profile roles',
        })
      )).data;
    } catch (e) {
      throw new Error(`Failed to get OIDCToken with ${username}:${password}, http-status: ${e.response?.status}`);
    }
  }

  private async initAxios() {
    const idToken = (await this.getOIDCToken()).id_token;

    this.axiosInstance = axios.create({
      baseURL: testConfig.API_URL,
      headers: {
        Authorization: 'Bearer ' + idToken
      }
    });
  }

  public createCourtThroughApi = async (court: NewCourt): Promise<Court> => {
    try {
      return (await this.axiosInstance.post('/courts/', court)).data;
    } catch (e) {
      throw new Error(`Failed to create/retrieve newly added court, http-status: ${e.response}`);
      //throw new Error('Failed to create/retrieve newly added court: ' + court.new_court_name);
    }
  };

  public getCourtThroughApi = (slug: string): Promise<AxiosResponse<Court>> => {
    return this.axiosInstance.get('/courts/' + slug);
  };

  /**
   * This method is used to delete the test court
   * @param slug - the slug of the test court
   * @throws Error - if the court could not be deleted
   */
  public deleteCourtThroughApi = async (slug: string) => {
    try {
      return await this.axiosInstance.delete(this.baseURL + slug);
    } catch (e) {
      throw new Error('Failed to delete test court with slug : ' + slug);
    }
  };

  /**
   * This method is used to remove all the local authorities for a given area of law for the test court
   * @param slug - the slug of the test court
   * @param areaOfLaw - the area of law for which the local authorities are to be removed
   * @throws Error - if the local authorities could not be removed
   */
  public removeLocalAuthoritiesThroughApi = async (slug: string, areaOfLaw: string) => {
    try {
      const data: LocalAuthority[] = [];
      return await this.axiosInstance.put(this.adminBaseUrl + slug + '/' + areaOfLaw + '/localAuthorities', data);
    } catch (e) {
      throw new Error('Failed to remove local authorities from test court with slug : ' + slug);
    }
  };
}

export = FactApiHelper;
