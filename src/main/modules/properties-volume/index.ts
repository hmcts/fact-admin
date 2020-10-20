import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application) {
    if (server.locals.env !== 'development') {
      propertiesVolume.addTo(config);
      console.log('idam-secret', get(config, 'secrets.fact.oauth-client-secret'));
      set(config, 'services.idam.clientSecret', get(config, 'secrets.fact.oauth-client-secret'));
      // set(config, 'secrets.div.AppInsightsInstrumentationKey', get(config, 'applicationInsights.instrumentationKey'));
    }
  }
}
