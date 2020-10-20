import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application) {
    if (server.locals.env !== 'development') {
      propertiesVolume.addTo(config);

      set(config, 'services.idam.clientSecret', get(config, 'secrets.fact.oauth-client-secret'));
      // set(config, 'applicationInsights.instrumentationKey', get(config, 'secrets.div.AppInsightsInstrumentationKey'));
    }
  }
}
