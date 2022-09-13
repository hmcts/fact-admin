import {LaunchDarkly} from '../../../../main/app/feature-flags/LaunchDarklyClient';
import launchDarkly, {LDUser} from 'launchdarkly-node-server-sdk';
import config from 'config';
import {when} from 'jest-when';

describe('LaunchDarkly', function () {

  const testFlag = 'test-flag';
  jest.mock('config');
  jest.mock('launchdarkly-node-server-sdk');

  config.get = jest.fn();
  launchDarkly.init = jest.fn();

  let mockLdClient: {
    waitForInitialization: () => Promise<any>;
    variation: (flag: string, ldUser: LDUser) => Promise<any>;
    allFlagsState: (ldUser: LDUser) => Promise<any>;
  };

  beforeEach(() => {
    mockLdClient = {
      waitForInitialization: async (): Promise<any> => {
      },
      variation: async (flag: string, ldUser: LDUser): Promise<any> => Promise.resolve({testFlag: true}),
      allFlagsState: async (ldUser: LDUser): Promise<any> => Promise.resolve(
        {
          allValues: () => {

          }
        }
      )
    };
  });

  test('Should initiate ldUser and client', function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(launchDarkly.init as jest.Mock)
      .mockReturnValue(mockLdClient);

    const featureFlags = new LaunchDarkly();
    expect(featureFlags['ldUser'].key).toEqual('fact-admin');
    expect(featureFlags['client']).toEqual(launchDarkly.init('sometestkey'));
  });

  test('Should get a flag value', async function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(launchDarkly.init as jest.Mock)
      .mockReturnValue(mockLdClient);

    expect(await new LaunchDarkly().getFlagValue(testFlag, false)).toEqual({testFlag: true});
  });

  test('Should get all flag values', async function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(launchDarkly.init as jest.Mock)
      .mockReturnValue(mockLdClient);

    expect(await new LaunchDarkly().getAllFlagValues(false)).toEqual({testFlag: true, testFlag2: true});
  });
});
