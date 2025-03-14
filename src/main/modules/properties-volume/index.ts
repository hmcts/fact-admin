import config from 'config';
import * as propertiesVolume from '@hmcts/properties-volume';
import {Application} from 'express';
import {spawnSync} from 'child_process';

export class PropertiesVolume {

  enableFor(server: Application) {
    if (server.locals.ENV !== 'development') {
      propertiesVolume.addTo(config);
      this.setSecret('secrets.fact.oauth-client-secret', 'services.idam.clientSecret');
      this.setSecret('secrets.fact.redis-access-key', 'session.secret');
      this.setSecret('secrets.fact.redis-access-key', 'session.redis.key');
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
      const value = config[fromPath as keyof typeof config];
      const keys = toPath.split('.');
      let target: any = config;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in target)) target[keys[i]] = {};
        target = target[keys[i]];
      }

      target[keys[keys.length - 1]] = value;
    }
  }

  private setLocalSecret(secret: string, toPath: string): void {
    // Load a secret from the AAT vault using azure cli
    const result = spawnSync('az', ['keyvault', 'secret', 'show', '--vault-name', 'fact-aat', '-o', 'tsv', '--query', 'value', '--name', secret], {encoding: 'utf8'});
    this.setDeepValue(config, toPath, encodeURI(result.stdout.trim()));
  }

  /**
   * Set secret value in config object
   * @param obj this is the config object
   * @param path the path to the secret in the config object
   * @param value the value of the secret
   */
  private setDeepValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    let target = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in target) || typeof target[keys[i]] !== 'object') {
        target[keys[i]] = {};
      }
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
  }

}
