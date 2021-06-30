import config from 'config';
import launchDarkly, { LDClient, LDOptions, LDUser } from 'launchdarkly-node-server-sdk';
import {FeatureFlagClient} from '../types/FeatureFlagClient';

class LaunchDarkly implements FeatureFlagClient {
  private static instance: LaunchDarkly
  private readonly client: LDClient;
  private readonly ldUser: LDUser;

  private constructor() {
    const sdkKey: string = config.get('launchDarkly.sdkKey');
    const options: LDOptions = { diagnosticOptOut: true };
    this.ldUser = { key: 'fact-admin' };
    this.client = launchDarkly.init(sdkKey, options);
  }

  public static getInstance(): LaunchDarkly {
    if (!LaunchDarkly.instance) {
      LaunchDarkly.instance = new LaunchDarkly();
    }

    return LaunchDarkly.instance;
  }

  public async getFlagValue(flag: string, defaultValue: boolean): Promise<boolean> {
    return this.client.variation(flag, this.ldUser, defaultValue);
  }

  public async getAllFlagValues(defaultValue: boolean): Promise<{ [p: string]: boolean }> {
    const flagMap = (await this.client.allFlagsState(this.ldUser)).allValues();
    for (const key in flagMap) {
      flagMap[key] = flagMap[key] ?? defaultValue;
    }

    return flagMap;
  }

  public onFlagChange(callback: Function, defaultValue: boolean, flag?: string) {
    if(flag) {
      this.client.on(`update:${flag}` , async () => callback(await this.getFlagValue(flag, defaultValue)));
    } else {
      this.client.on('update' , async () => callback(await this.getAllFlagValues(defaultValue)));
    }
  }
}

export default LaunchDarkly;
