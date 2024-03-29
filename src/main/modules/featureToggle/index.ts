import {NextFunction, Request, Response} from 'express';
import {FeatureFlagClient} from '../../types/FeatureFlagClient';

export default class FeatureToggleService {
  private static featureFlagClient: FeatureFlagClient;

  constructor(featureFlagClient: FeatureFlagClient) {
    FeatureToggleService.featureFlagClient = featureFlagClient;
  }

  static getFlagValue = (flag: string, defaultValue = false) => {
    return FeatureToggleService.featureFlagClient.getFlagValue(flag, defaultValue);
  };

  static getAllFlagValues = (defaultValue = false) => {
    return FeatureToggleService.featureFlagClient.getAllFlagValues(defaultValue);
  };

  static onFlagChange = (callback: Function, flag?: string, defaultValue = false) => {
    FeatureToggleService.featureFlagClient.onFlagChange(callback, defaultValue, flag);
  };

  static toggleController = (flag: string, controller: Function, defaultValue = false) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      FeatureToggleService.getFlagValue(flag, defaultValue)
        .then(flagValue => {
          if(flagValue) {
            controller(req, res, next);
          } else {
            next();
          }
        })
        .catch(() => {
          next();
        });
    };
  };
}
