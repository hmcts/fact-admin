import {Application} from 'express';
import session from 'express-session';
declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}
import ConnectRedis from 'connect-redis';
import * as redis from 'redis';
import config from 'config';
import FileStoreFactory from 'session-file-store';

const RedisStore = ConnectRedis(session);
const FileStore = FileStoreFactory(session);

export class SessionStorage {
  readonly developmentMode: boolean;

  constructor(developmentMode: boolean) {
    this.developmentMode = developmentMode;
  }

  public enableFor(server: Application) {

    if (!this.developmentMode) {
      server.set('trust proxy', 1);
    }


    server.use(session({
      name: 'fact-session',
      resave: false,
      saveUninitialized: false,
      secret: config.get('session.secret'),
      cookie: {
        httpOnly: true,
        sameSite: true,
        secure:  config.get('session.secure-flag')
      },
      store: this.getStore()
    }));
  }

  private getStore() {
    return !config.get('session.redis.host')
      ? new FileStore({ path: '/tmp' })
      : new RedisStore({
        client: redis.createClient({
          host: config.get('session.redis.host') as string,
          password: config.get('session.redis.key') as string,
          port: 6380,
          tls: true
        })
      });
  }
}
