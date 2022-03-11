import {Application, NextFunction, Request, Response} from 'express';
import {asClass, asValue} from 'awilix';
import Axios from 'axios';
import config from 'config';
import {FactApi} from '../../app/fact/FactApi';
import {AuthedRequest} from '../../types/AuthedRequest';
// eslint-disable-next-line @typescript-eslint/camelcase
import jwt_decode from 'jwt-decode';
import {AzureBlobStorage} from '../../app/azure/AzureBlobStorage';
import {IdamApi} from '../../app/fact/IdamApi';
import {BlobServiceClient, newPipeline, StorageSharedKeyCredential} from '@azure/storage-blob';

/**
 * Adds the oidc middleware to add oauth authentication
 */
export class OidcMiddleware {

  public enableFor(server: Application): void {
    const loginUrl: string = config.get('services.idam.authorizationURL');
    const tokenUrl: string = config.get('services.idam.tokenURL');
    const sessionUrl: string = config.get('services.idam.sessionURL');
    const clientId: string = config.get('services.idam.clientID');
    const clientSecret: string = config.get('services.idam.clientSecret');
    const redirectUri: string = config.get('services.idam.callbackURL');

    server.get('/login', (req, res) => {
      res.redirect(loginUrl + '?client_id=' + clientId + '&response_type=code&redirect_uri=' + encodeURI(redirectUri) + '&scope=openid%20roles%20profile%20search-user%20manage-user');
    });

    server.get('/oauth2/callback', async (req: Request, res: Response) => {
      const response = await Axios.post(
        tokenUrl,
        `client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(redirectUri)}&code=${encodeURIComponent(req.query.code as string)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      req.session.user = response.data;
      req.session.user.jwt = jwt_decode(response.data.id_token);
      req.session.user.isSuperAdmin = req.session.user.jwt.roles.includes('fact-super-admin');
      res.render('redirect');
    });

    server.get('/logout', async function(req, res){
      const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64');
      if (req.session.user) {
        await Axios.delete(
          sessionUrl + '/' + req.session.user.access_token,
          {
            headers: {
              Authorization: 'Basic ' + encode(clientId + ':' + clientSecret)
            }
          }
        ).catch((error) => {
          res.status(400);
          return error;
        });
        req.session.destroy(() => res.render('logout'));
      } else res.render('logout');
    });

    server.post('/getAccessToken', async (req: Request, res: Response) => {

      const response = await Axios.post(
        tokenUrl,
        `client_id=${clientId}&client_secret=${clientSecret}&grant_type=password&password=${encodeURIComponent(req.body.password)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid roles profile search-user manage-user create-user&username=${encodeURIComponent(req.session.user.jwt.sub)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      ).catch((error) => {
        res.status(400);
        return error;
      });

      if (response.data) {
        req.session.user = response.data;
        req.session.user.jwt = jwt_decode(response.data.id_token);
        req.session.user.isSuperAdmin = req.session.user.jwt.roles.includes('fact-super-admin');

      }

      res.send();

    });

    server.use((req: AuthedRequest, res: Response, next: NextFunction) => {
      if (req.session.user) {

        const sharedKeyCredential = new StorageSharedKeyCredential(
          config.get('services.image-store.account-name'),
          config.get('services.image-store.account-key'));
        const pipeline = newPipeline(sharedKeyCredential);

        const blobServiceClient = new BlobServiceClient(
          `https://${config.get('services.image-store.account-name')}.blob.core.windows.net`,
          pipeline
        );
        const containerClient = blobServiceClient.getContainerClient('images');

        req.scope = req.app.locals.container.createScope();
        req.scope.register({
          axios: asValue(Axios.create({
            baseURL: config.get('services.api.url'),
            headers: {
              Authorization: 'Bearer ' + req.session.user.id_token
            }
          })),
          api: asClass(FactApi),
          azure: asValue(new AzureBlobStorage(containerClient)),
          idamApi : asClass(IdamApi)
        });

        res.locals.isLoggedIn = true;
        res.locals.isSuperAdmin = req.session.user.jwt.roles.includes('fact-super-admin');

        return next();
      }

      if (req.xhr) {
        res.status(302).send({ url: '/login' });
      } else {
        res.redirect('/login');
      }
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
