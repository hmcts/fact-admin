import { Application } from 'express';
import os from 'os';
import { infoRequestHandler } from '@hmcts/info-provider';
import { Request } from 'express';
import config from 'config';
const healthcheck = require('@hmcts/nodejs-healthcheck');


/**
 * Sets up the HMCTS info and health endpoints
 */
export class HealthCheck {

  private readonly hmctsAccessUrl: string = config.get('services.idam.hmctsAccessURL');
  private readonly factApiUrl: string = config.get('services.api.url');

  public enableFor(app: Application): void {

    app.get(
      '/info',
      infoRequestHandler({
        extraBuildInfo: {
          host: os.hostname(),
          name: 'fact-admin',
          uptime: process.uptime(),
        },
        info: { },
      }),
    );

    const healthOptions = {
      callback: (err: Error, res: Request): Promise<void> => {
        if (err) {
          if (res?.body) {
            console.log('health check response: ' + JSON.stringify(res.body) + '; error: ', JSON.stringify(err));
          } else {
            console.log('healthcheck failed, empty response', err);
          }
        }
        return res?.body?.status === 'UP' ? healthcheck.up() : healthcheck.down();
      },
      timeout: config.get('health.timeout'),
      deadline: config.get('health.deadline'),
    };

    const healthCheckConfig = {
      checks: {
        'fact-api': healthcheck.web(`${this.factApiUrl}/health`, healthOptions),
        'hmcts-access': healthcheck.web(`${this.hmctsAccessUrl}/health`, healthOptions),
      },
      buildInfo: {
        name: 'fact-admin',
        host: os.hostname(),
        uptime: process.uptime(),
      },
    };

    healthcheck.addTo(app, healthCheckConfig);
  }
}
