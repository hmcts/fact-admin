import config from 'config';
import launchDarkly, {
  LDClient,
  LDFlagSet,
  LDFlagValue,
  LDOptions,
  LDUser
} from 'launchdarkly-node-server-sdk';

class LaunchDarkly {
  private static instance: LaunchDarkly
  private readonly client: LDClient;
  private readonly ldUser: LDUser;
  private ready = false;

  private constructor() {
    const sdkKey: string = config.get('launchDarkly.sdkKey');
    const options: LDOptions = config.get('featureToggles.enabled') ? { diagnosticOptOut: true } : { offline: true };
    this.ldUser = { key: 'fact-admin' };

    this.client = launchDarkly.init(sdkKey, options);
    this.client.once('ready', async () => {
      this.ready = true;
    });
  }

  public static getInstance(): LaunchDarkly {
    if (!LaunchDarkly.instance) {
      LaunchDarkly.instance = new LaunchDarkly();
    }

    return LaunchDarkly.instance;
  }

  public variation(flagName: string, defaultValue: boolean, callback?: (err: any, res: any) => void): void | Promise<LDFlagValue> {
    if (this.ready) {
      return this.client.variation(flagName, this.ldUser, defaultValue, callback);
    }

    this.client.once('ready', () => {
      this.ready = true;
      return this.variation(flagName, defaultValue, callback);
    });
  }

  public async allFlagsState(): Promise<LDFlagSet> {
    if (this.ready) {
      return (await this.client.allFlagsState(this.ldUser)).allValues();
    }

    this.client.once('ready', () => {
      this.ready = true;
      return this.allFlagsState();
    });
  }

  public onFlagUpdate(callback: Function, flag?: string): LDFlagSet | LDFlagValue {
    if(flag) {
      this.client.on(`update:${flag}` , async () => callback(await this.variation(flag, false)));
    } else {
      this.client.on('update' , async () => callback(await this.allFlagsState()));
    }
  }

  public close(): void {
    this.client.close();
  }
}

export default LaunchDarkly;
