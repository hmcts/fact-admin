import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {Application} from 'express';
import {get, set} from 'lodash';
import {execSync} from 'child_process';

export class PropertiesVolume {

  enableFor(server: Application) {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);
      this.setSecret('secrets.fact.oauth-client-secret', 'services.idam.clientSecret');
      this.setSecret('secrets.fact.redis-access-key', 'session.secret');
      this.setSecret('secrets.fact.AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
      this.setSecret('secrets.fact.csrf-token-secret', 'csrf.tokenSecret');
      this.setSecret('secrets.fact.user-lock-timeout', 'lock.timeout');
      this.setSecret('secrets.fact.launchdarkly-sdk-key', 'launchDarkly.sdkKey');
      this.setSecret('secrets.fact.storage-account-name', 'services.image-store.account-name');
      this.setSecret('secrets.fact.storage-account-primary-key', 'services.image-store.account-key');
    } else {
      this.setLocalSecret('AppInsightsInstrumentationKey', 'appInsights.instrumentationKey');
      this.setLocalSecret('launchdarkly-sdk-key', 'launchDarkly.sdkKey');
      this.setLocalSecret('oauth-client-secret', 'services.idam.clientSecret');
      this.setLocalSecret('storage-account-name', 'services.image-store.account-name');
      this.setLocalSecret('storage-account-primary-key', 'services.image-store.account-key');
      this.setLocalSecret('csrf-token-secret', 'csrf.tokenSecret');
      this.setLocalSecret('user-lock-timeout', 'lock.timeout');
    }
  }

  /**
   * Load a secret from the AAT vault using azure cli
   */
  private setSecret(fromPath: string, toPath: string): void {
    if (config.has(fromPath)) {
      set(config, toPath, get(config, fromPath));
    }
  }

  private setLocalSecret(secret: string, toPath: string): void {
    // Load a secret from the AAT vault using azure cli
    const result = execSync('az keyvault secret show --vault-name fact-aat -o tsv --query value --name ' + secret);
    set(config, toPath, result.toString().replace('\n', ''));
  }
}
