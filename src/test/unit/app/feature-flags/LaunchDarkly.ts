import {expect} from 'chai';
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
  };

  beforeEach(() => {
    mockLdClient = {
      waitForInitialization: async (): Promise<any> => {},
      variation: async (flag: string, ldUser: LDUser):
        Promise<any> => Promise.resolve({testFlag: true})
    };
  });

  test('Should initiate ldUser and client', function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(launchDarkly.init as jest.Mock)
      .mockReturnValue(launchDarkly.init(config.get('launchDarkly.sdkKey')));

    const featureFlags = new LaunchDarkly();
    expect(featureFlags['ldUser'].key).equal('fact-admin');
    expect(featureFlags).to.have.property('client', launchDarkly.init('sometestkey'));
  });

  test('Should get a flag value', async function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(launchDarkly.init as jest.Mock)
      .mockReturnValue(mockLdClient);

    expect(await new LaunchDarkly().getFlagValue(testFlag, false))
      .eql({testFlag: true});
  });
});
