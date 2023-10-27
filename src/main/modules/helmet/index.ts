import * as express from 'express';
import helmet from 'helmet';

export interface HelmetConfig {
  referrerPolicy: string
}

const googleAnalyticsDomain = '*.google-analytics.com';
const self = "'self'";
const azureBlob = '*.blob.core.windows.net';

/**
 * Module that enables helmet in the application
 */
export class Helmet {
  constructor(public config: HelmetConfig) {}

  public enableFor(app: express.Express): void {
    // include default helmet functions
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
    }));

    this.setContentSecurityPolicy(app);
    this.setReferrerPolicy(app, this.config.referrerPolicy);
  }

  private setContentSecurityPolicy(app: express.Express): void {
    const scriptSrc = [self, googleAnalyticsDomain, "'unsafe-inline'"];

    //todo: should really only use this in dev
    if (app.locals.ENV === 'development') {
      scriptSrc.push("'unsafe-eval'");
    }

    app.use(
      helmet.contentSecurityPolicy({
        useDefaults: false,
        directives: {
          connectSrc: [self, azureBlob],
          defaultSrc: ["'none'"],
          fontSrc: [self, 'data:'],
          imgSrc: [self, 'data:', googleAnalyticsDomain, azureBlob],
          objectSrc: [self],
          scriptSrc: scriptSrc,
          styleSrc: [self, "'unsafe-inline'"],
        },
      })
    );
  }

  private setReferrerPolicy(app: express.Express, policy: string): void {
    if (!policy) {
      throw new Error('Referrer policy configuration is required');
    }

    app.use(helmet.referrerPolicy({ policy }));
  }

}
