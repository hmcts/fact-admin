import { LaunchDarkly } from '../../../main/app/feature-flags/LaunchDarklyClient';
import config from 'config';

export class FeatureFlagHelper {

  private flagValues: { [p: string]: boolean } | void;

  public async init() {
    const user: string = config.get('launchDarkly.ldUser');
    const sdkKey: string = config.get('launchDarkly.sdkKey');
    this.flagValues = await new LaunchDarkly(user, sdkKey).getAllFlagValues(false);
  }

  public getLocalFlag(flag:string) : boolean {
    if(this.flagValues){
      return this.flagValues[flag];
    }
  }
}
