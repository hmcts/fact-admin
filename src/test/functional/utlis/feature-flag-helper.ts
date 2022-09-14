//import * as I from './puppeteer.util';
//import {expect} from 'chai';
import { LaunchDarkly } from '../../../main/app/feature-flags/LaunchDarklyClient';
import { FeatureFlags } from '../../../main/app/feature-flags/FeatureFlags';

export class FeatureFlagHelper {

  private flagValues: { [key: string]: boolean };

  async _init() {
    const launchDarkly = new LaunchDarkly('fact-admin', process.env.LAUNCHDARKLY_SDK_KEY);
    this.flagValues = await new FeatureFlags(launchDarkly).getAllFlagValues();
    launchDarkly.closeConnection();
  }

}
