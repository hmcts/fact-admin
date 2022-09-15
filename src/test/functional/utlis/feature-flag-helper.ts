import { LaunchDarkly } from '../../../main/app/feature-flags/LaunchDarklyClient';
import { FeatureFlags } from '../../../main/app/feature-flags/FeatureFlags';

import config from 'config';
 // import launchDarkly, {LDClient, LDUser} from 'launchdarkly-node-server-sdk';
 // import {FeatureFlagClient} from './FeatureFlags';

export class FeatureFlagHelper {

  private flagValues: { [p: string]: boolean } | void;



  public async init() {
    const sdkKey: string = config.get('launchDarkly.sdkKey');
    const launchDarkly = new LaunchDarkly('fact-admin', sdkKey);
    //const launchDarkly = new LaunchDarkly('fact-admin', process.env.LAUNCHDARKLY_SDK_KEY);
    this.flagValues = await new FeatureFlags(launchDarkly).getAllFlagValues();
    launchDarkly.closeConnection();
  }

  public getLocalFlag(flag:string) : boolean {
    if(this.flagValues){
      return this.flagValues[flag];
    }
  }

}
//config.get('launchDarkly.sdkKey')
