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

    const healthOptions = () => {
      return {
        callback: (err: Error, res: Request): Promise<void> => {
          if (err) {
            console.log('Health check failed!');
          }
          return res.body.status == 'good' ? healthcheck.up() : healthcheck.down();
        },
        timeout: config.get('health.timeout'),
        deadline: config.get('health.deadline'),
      };
    };

    const healthCheckConfig = {
      checks: {
        'fact-api': healthcheck.web(`${config.get('services.api.url')}/health`, healthOptions),
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
