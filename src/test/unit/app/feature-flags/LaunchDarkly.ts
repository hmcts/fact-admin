import {LaunchDarkly} from '../../../../main/app/feature-flags/LaunchDarklyClient';
import * as launchDarkly from '@launchdarkly/node-server-sdk';
import {LDClient, LDUser} from '@launchdarkly/node-server-sdk';
import config from 'config';
import {when} from 'jest-when';

jest.mock('@launchdarkly/node-server-sdk', () => ({
  init: jest.fn()
}));

describe('LaunchDarkly', function () {

  const testFlag = 'test-flag';
  const multipleFlags = {'test-flag':true, 'test-flag2':true};
  jest.mock('config');

  config.get = jest.fn();
  const mockedInit = jest.mocked(launchDarkly.init);

  let mockLdClient: Pick<LDClient, 'waitForInitialization' | 'variation' | 'allFlagsState'>;

  beforeEach(() => {
    mockLdClient = {
      waitForInitialization: async (): Promise<any> => {},
      variation: async (flag: string, ldUser: LDUser): Promise<any> => Promise.resolve({testFlag: true}),
      allFlagsState: async (ldUser: LDUser): Promise<any> => Promise.resolve({
        allValues: () => {
          return multipleFlags;
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
    when(mockedInit)
      .mockReturnValue(mockLdClient as LDClient);

    const featureFlags = new LaunchDarkly();
    expect(featureFlags['ldUser'].key).toEqual('fact-admin');
    expect(featureFlags['client']).toEqual(mockedInit('sometestkey'));
  });

  test('Should get a flag value', async function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(mockedInit)
      .mockReturnValue(mockLdClient as LDClient);

    expect(await new LaunchDarkly().getFlagValue(testFlag, false)).toEqual({testFlag: true});
  });

  test('Should get all flag values', async function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(mockedInit)
      .mockReturnValue(mockLdClient as LDClient);

    expect(await new LaunchDarkly().getAllFlagValues(false)).toEqual(multipleFlags);
  });
});
