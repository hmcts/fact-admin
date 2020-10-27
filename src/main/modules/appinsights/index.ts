import { Application } from 'express';
import config from 'config';
const appInsights = require('applicationinsights');

export class AppInsights {

  enableFor(server: Application): void {
    if (config.get('appInsights.instrumentationKey')) {
      appInsights.setup(config.get('appInsights.instrumentationKey'))
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .start();

      appInsights.defaultClient.trackTrace({message: 'App insights activated'});
    }
  }
}
