import {Application, NextFunction, Request, Response} from 'express';
import config from 'config';
import {AuthedRequest} from '../../types/AuthedRequest';
import jwt_decode from 'jwt-decode';
import {Logger} from '../../types/Logger';
import ConnectRedis from 'connect-redis';
import session from 'express-session';
import FileStoreFactory from 'session-file-store';
import {auth, Session} from 'express-openid-connect';
import {jwtToken, User} from '../../types/User';
import {createClient} from 'redis';
import { BlobServiceClient, newPipeline, StorageSharedKeyCredential } from '@azure/storage-blob';
import { asClass, asValue } from 'awilix';
import { FeatureFlags } from '../../app/feature-flags/FeatureFlags';
import { LaunchDarkly } from '../../app/feature-flags/LaunchDarklyClient';
import { AzureBlobStorage } from '../../app/azure/AzureBlobStorage';
import { FactApi } from '../../app/fact/FactApi';
import Axios from 'axios';


export class OidcMiddleware {

  constructor(public logger: Logger) {
    this.logger = logger;
  }

  public enableFor(app: Application): void {
    const clientId: string = config.get('services.idam.clientID');
    const clientSecret: string = config.get('services.idam.clientSecret');
    const secret: string = config.get('session.secret');
    const issuerBaseURL: string = config.get('services.idam.authorizationURL');
    const baseURL: string = config.get('services.idam.baseURL');

    app.use(auth({
      issuerBaseURL: issuerBaseURL,
      baseURL: baseURL,
      clientID: clientId,
      secret: secret,
      clientSecret: clientSecret,
      clientAuthMethod: 'client_secret_post',
      idpLogout: true,
      routes: {
        callback: 'oauth2/callback'
      },
      authorizationParams: {
        'response_type': 'code',
        scope: 'openid profile roles manage-user search-user create-user',
      },
      session: {
        rollingDuration: 20 * 60,
        cookie: {
          httpOnly: true,
        },
        rolling: true,
        store: this.getStore(app)
      },
      afterCallback: (req: Request, res: Response, session: Session) => {
        const user = jwt_decode(session.access_token) as User;
        user.jwt = jwt_decode(session.id_token) as jwtToken;

        return { ...session, user };
      }
    }));

    app.use(async (req: AuthedRequest, res: Response, next: NextFunction) => {

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
          axios: asValue(Axios.create({
            baseURL: config.get('services.api.url'),
            headers: {
              Authorization: 'Bearer ' + req.appSession.id_token
            }
          })),
          api: asClass(FactApi),
          featureFlags: asValue(new FeatureFlags(new LaunchDarkly())),
          azure: asValue(new AzureBlobStorage(containerClient)),
        });

        res.locals.isLoggedIn = true;
        req.appSession.user.isSuperAdmin = req.appSession.user.jwt.roles.includes('fact-super-admin');
        res.locals.isViewer = req.appSession.user.jwt.roles.includes('fact-viewer');
        res.locals.isSuperAdmin = req.appSession.user.isSuperAdmin;

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
}


export const isSuperAdmin = (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (res.locals.isSuperAdmin) {
    next();
  } else {
    res.redirect('/courts');
  }
};

