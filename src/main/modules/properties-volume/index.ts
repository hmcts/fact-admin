import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application) {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);

      set(config, 'services.idam.clientSecret', get(config, 'secrets.fact.oauth-client-secret'));
      set(config, 'session.redis.key', get(config, 'secrets.fact.redis-access-key'));
      set(config, 'session.secret', get(config, 'secrets.fact.redis-access-key'));
      set(config, 'appInsights.instrumentationKey', get(config, 'secrets.fact.AppInsightsInstrumentationKey'));
    }
  }
}
