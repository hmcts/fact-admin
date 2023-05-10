import {Application, NextFunction, Request, Response} from 'express';
import {asClass, asValue} from 'awilix';
import axios, { AxiosInstance } from 'axios';
import config from 'config';
import {FactApi} from '../../app/fact/FactApi';
import {AuthedRequest} from '../../types/AuthedRequest';
import jwt_decode from 'jwt-decode';
import {AzureBlobStorage} from '../../app/azure/AzureBlobStorage';
import {IdamApi} from '../../app/fact/IdamApi';
import {BlobServiceClient, newPipeline, StorageSharedKeyCredential} from '@azure/storage-blob';
import {FeatureFlags} from '../../app/feature-flags/FeatureFlags';
import {LaunchDarkly} from '../../app/feature-flags/LaunchDarklyClient';
import {Logger} from '../../types/Logger';
import ConnectRedis from 'connect-redis';
import session from 'express-session';
import FileStoreFactory from 'session-file-store';
import {auth, Session} from 'express-openid-connect';
//import * as redis from 'redis';
import {User} from '../../types/User';
import {createClient} from 'redis';
//const RedisStore = ConnectRedis(session);
//const FileStore = FileStoreFactory(session);
/**
 * Adds the oidc middleware to add oauth authentication
 */
export class OidcMiddleware {

  constructor(public logger: Logger) {
    this.logger = logger;
  }

  public enableFor(server: Application): void {
    //const loginUrl: string = config.get('services.idam.authorizationURL');
    //const tokenUrl: string = config.get('services.idam.tokenURL');
    //const sessionUrl: string = config.get('services.idam.sessionURL');
    const clientId: string = config.get('services.idam.clientID');
    const clientSecret: string = config.get('services.idam.clientSecret');
    const redirectUri: string = config.get('services.idam.callbackURL');
    const secret: string = config.get('session.secret');

    // server.get('/login', (req, res) => {
    //   res.redirect(loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri) + '&scope=openid%20roles%20profile%20search-user%20manage-user');
    // });

    server.get('/oauth2/callback', async (req: AuthedRequest, res: Response, next: NextFunction) => {
      //const user = req.query.code;
      const user = req.oidc.user;
      //const user = req.appSession.user;
      res.send(`hello ${user}`);
      next();
    });


    // server.get('/logout', async (req: Request, res: Response) => {
    //   const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64');
    //   if (req.session.user) {
    //     await Axios.delete(
    //       sessionUrl + '/' + req.session.user.access_token,
    //       {
    //         headers: {
    //           Authorization: 'Basic ' + encode(clientId + ':' + clientSecret)
    //         }
    //       }
    //     )
    //       .catch((error) => {
    //         res.status(400);
    //         this.logger.error('Failed to logout. '
    //           + (error.response?.data?.error_description ? error.response.data.error_description : error));
    //         return error;
    //       });
    //     req.session.destroy(() => res.redirect('/login'));
    //   } else {
    //     this.logger.debug('Logged out without user details being present');
    //     return res.redirect('/login');
    //   }
    // });

    // server.post('/getAccessToken', async (req: Request, res: Response) => {
    //   const response = await Axios.post(
    //     tokenUrl,
    //     `client_id=${clientId}&client_secret=${clientSecret}&grant_type=password&password=${encodeURIComponent(req.body.password)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid roles profile search-user manage-user create-user&username=${encodeURIComponent(req.session.user.jwt.sub)}`,
    //     {
    //       headers: {
    //         Accept: 'application/json',
    //         'Content-Type': 'application/x-www-form-urlencoded'
    //       }
    //     }
    //   ).catch((error) => {
    //     res.status(400);
    //     this.logger.error('Failed to get access code. '
    //       + (error.response?.data?.error_description ? error.response.data.error_description : error));
    //     return error;
    //   });
    //
    //   if (response.data) {
    //     req.session.user = response.data;
    //     req.session.user.jwt = jwt_decode(response.data.id_token);
    //     req.session.user.isSuperAdmin = req.session.user.jwt.roles.includes('fact-super-admin');
    //   }
    //   res.send();
    // });


    server.use(auth({
      issuerBaseURL: 'https://idam-web-public.aat.platform.hmcts.net/o',
      baseURL: 'http://localhost:3300/',
      clientID: clientId,
      secret: secret,
      clientSecret: clientSecret,
      clientAuthMethod: 'client_secret_post',
      authRequired: false,
      idpLogout: false,
      errorOnRequiredAuth: true,
      authorizationParams: {
        //issuer_override: true,
        response_type: 'code',
        scope: 'openid profile roles manage-user search-user create-user',
        redirect_uri: redirectUri
      },
      session: {
        name: 'fact-session',
        rollingDuration: 20 * 60,
        cookie: {
          httpOnly: true,
          sameSite: 'None',
        },
        rolling: true,
        store: this.getStore(server)
      },
      afterCallback: (req: Request, res: Response, session: Session) => {
        const user = jwt_decode(session.id_token) as User;

        return {...session, user};
      }
    }));

    server.use(async (req: AuthedRequest, res: Response, next: NextFunction) => {

      if (req.appSession.user) {
        const sharedKeyCredential = new StorageSharedKeyCredential(
          config.get('services.image-store.account-name'),
          config.get('services.image-store.account-key'));
        const pipeline = newPipeline(sharedKeyCredential);

        const blobServiceClient = new BlobServiceClient(
          `https://${config.get('services.image-store.account-name')}.blob.core.windows.net`,
          pipeline
        );
        const containerClient = blobServiceClient.getContainerClient('images');

        req.scope = req.app.locals.container.createScope().register({

          userAxios: asValue(this.createAuthedAxiosInstance(req.appSession.access_token)),
          api: asClass(FactApi),
          featureFlags: asValue(new FeatureFlags(new LaunchDarkly())),
          azure: asValue(new AzureBlobStorage(containerClient)),
          idamApi: asClass(IdamApi)
        });

        res.locals.isLoggedIn = true;
        res.locals.isViewer = req.appSession.user.roles.includes('fact-viewer');
        res.locals.isSuperAdmin = req.appSession.user.roles.includes('fact-super-admin');

        if (req.url.includes('/oauth2/callback')) {
          // Redirect to the main page without including an intermediary redirect page
          const courts = await req.scope.cradle.api.getCourts();
          const regions = await req.scope.cradle.api.getRegions();
          await req.scope.cradle.api.deleteCourtLocksByEmail(req.session['user']['jwt']['sub']);
          return res.render('courts/courts', {courts, regions});
        }
        return next();
      } else if (req.xhr) {
        res.status(302).send({url: '/login'});
      } else return res.redirect('/login');
    });


  }

  private getStore(app: Application): any {
    const redisStore = ConnectRedis(session);
    const fileStore = FileStoreFactory(session);

    const redisHost: string = config.get('session.redis.host');
    const redisPass: string = config.get('session.redis.key');

    if (redisHost && redisPass) {
      const client = createClient({
        host: redisHost,
        password: redisPass,
        port:6380,
        tls: true
      });

      app.locals.redisClient = client;
      return new redisStore({ client });
    }

    return new fileStore({ path: '/tmp' });
  }


  private createAuthedAxiosInstance(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: config.get('services.idam.url.api'),
      headers: {Authorization: 'Bearer ' + accessToken}
    });
  }
}


export const isSuperAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (res.locals.isSuperAdmin) {
    next();
  } else {
    res.redirect('/courts');
  }
};

export type AuthedUser = {
  id_token: string
}
