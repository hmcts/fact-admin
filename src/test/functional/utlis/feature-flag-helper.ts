import {LaunchDarkly} from '../../../main/app/feature-flags/LaunchDarklyClient';
import {FeatureFlags} from '../../../main/app/feature-flags/FeatureFlags';

export class FeatureFlagHelper {

  private flagValues: { [p: string]: boolean } | void;

  public async init() {

    console.log(process.env.LAUNCHDARKLY_SDK_KEY);
    const launchDarkly = await new LaunchDarkly('fact-admin', process.env.LAUNCHDARKLY_SDK_KEY);
    this.flagValues = await new FeatureFlags(launchDarkly).getAllFlagValues();
    launchDarkly.closeConnection();
  }

  public getAllFlags(): { [p: string]: boolean } | void {
    return this.flagValues;
  }

}
