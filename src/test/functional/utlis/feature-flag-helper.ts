import {LaunchDarkly} from '../../../main/app/feature-flags/LaunchDarklyClient';
import config from 'config';
import {FeatureFlags} from '../../../main/app/feature-flags/FeatureFlags';

export class FeatureFlagHelper {

  private flagValues: { [p: string]: boolean } | void;

  public async init() {

    console.log(process.env.LAUNCHDARKLY_SDK_KEY);
    console.log('inside of init');
    console.log(config.get('launchDarkly.ldUser'));
    console.log(config.get('launchDarkly.sdkKey'));
    const user: string = config.get('launchDarkly.ldUser');
    const sdkKey: string = config.get('launchDarkly.sdkKey');
    const launchDarkly = await new LaunchDarkly(user, sdkKey);
    this.flagValues = await new FeatureFlags(launchDarkly).getAllFlagValues();
    launchDarkly.closeConnection();
  }

  public getAllFlags(): { [p: string]: boolean } | void {
    return this.flagValues;
  }

}
