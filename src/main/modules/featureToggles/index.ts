import LaunchDarkly from '../../utils/LaunchDarkly';
import {LDFlagSet, LDFlagValue} from 'launchdarkly-node-server-sdk';
import {Application, NextFunction, Request, Response} from 'express';

export default class FeatureToggles {
  private static flagClient: LaunchDarkly

  public static enableFor(server: Application): void {
    FeatureToggles.flagClient = FeatureToggles.getFlagClient();
  }

  private static getFlagClient(): LaunchDarkly {
    return LaunchDarkly.getInstance();
  }

  public static getFlagValue = async(flag: string): Promise<LDFlagValue> => {
    return FeatureToggles.flagClient.variation(flag, false);
  }

  public static onFlagUpdate = (callback: Function, flag?: string): LDFlagSet | LDFlagValue => {
    FeatureToggles.flagClient.onFlagUpdate(callback, flag);
  }

  public static toggleController = (flag: string, controller: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      FeatureToggles.getFlagValue(flag)
        .then(flagValue => flagValue ? controller(req, res, next) : next())
        .catch(() => next());
    };
  }
}
