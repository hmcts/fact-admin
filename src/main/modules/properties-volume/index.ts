import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import { Application } from 'express';
import { get, set } from 'lodash';

export class PropertiesVolume {

  enableFor(server: Application) {
    if (server.locals.env !== 'development') {
      propertiesVolume.addTo(config);

      set(config, 'secrets.fact.oauth-client-secret', get(config, 'services.idam.clientSecret'));
      // set(config, 'secrets.div.AppInsightsInstrumentationKey', get(config, 'applicationInsights.instrumentationKey'));
    }
  }
}
