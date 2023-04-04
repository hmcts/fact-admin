import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {Application} from 'express';
import {get, set} from 'lodash';
import {execSync} from 'child_process';

export class PropertiesVolume {

  enableFor(server: Application) {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);
      set(config, 'services.idam.clientSecret', get(config, 'secrets.fact.aad-client-secret'));
      set(config, 'session.redis.key', get(config, 'secrets.fact.redis-access-key'));
      set(config, 'session.secret', get(config, 'secrets.fact.redis-access-key'));
      set(config, 'appInsights.instrumentationKey', get(config, 'secrets.fact.AppInsightsInstrumentationKey'));
      set(config, 'csrf.tokenSecret', get(config, 'secrets.fact.csrf-token-secret'));
      set(config, 'lock.timeout', get(config, 'secrets.fact.user-lock-timeout'));
      set(config, 'launchDarkly.sdkKey', get(config, 'secrets.fact.launchdarkly-sdk-key'));
      set(config, 'services.image-store.account-name', get(config, 'secrets.fact.storage-account-name'));
      set(config, 'services.image-store.account-key', get(config, 'secrets.fact.storage-account-primary-key'));
    } else {
      this.setLocalSecret('aad-client-secret', 'services.idam.clientSecret');
      this.setLocalSecret('csrf-token-secret', 'csrf.tokenSecret');
      this.setLocalSecret('user-lock-timeout', 'lock.timeout');
      this.setLocalSecret('launchdarkly-sdk-key', 'launchDarkly.sdkKey');
      this.setLocalSecret('storage-account-name', 'services.image-store.account-name');
      this.setLocalSecret('storage-account-primary-key', 'services.image-store.account-key');
    }
  }

  /**
   * Load a secret from the AAT vault using azure cli
   */
  private setLocalSecret(secret: string, toPath: string): void {
    const result = execSync('az keyvault secret show --vault-name fact-aat -o tsv --query value --name ' + secret);

    set(config, toPath, result.toString().replace('\n', ''));
  }
}
