import { Application } from 'express';
import session, { MemoryStore } from 'express-session';
import ConnectRedis from 'connect-redis';
import * as redis from 'redis';
import config from 'config';

const RedisStore = ConnectRedis(session);

export class SessionStorage {

  public enableFor(server: Application) {
    server.use(session({
      name: 'fact-session',
      resave: false,
      saveUninitialized: false,
      secret: config.get('session.secret'),
      cookie: {
        httpOnly: true,
        sameSite: true
      },
      store: this.getStore()
    }));
  }

  private getStore() {
    return !config.get('session.redis.host')
      ? new MemoryStore()
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
