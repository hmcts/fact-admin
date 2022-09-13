import {expect} from 'chai';
import {LaunchDarkly} from '../../../../main/app/feature-flags/LaunchDarklyClient';
import launchDarkly, {LDClient} from 'launchdarkly-node-server-sdk';
import config from 'config';
import {when} from 'jest-when';

describe('LaunchDarkly', function () {

  const testFlag = 'test-flag';
  jest.mock('config');
  jest.mock('launchdarkly-node-server-sdk');

  config.get = jest.fn();
  const client: LDClient = launchDarkly.init('sometestkey');
  launchDarkly.init = jest.fn();
  client.waitForInitialization = jest.fn();

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

  test('Should get a flag value',async function () {
    when(config.get as jest.Mock).calledWith('launchDarkly.ldUser')
      .mockReturnValue('fact-admin');
    when(config.get as jest.Mock).calledWith('launchDarkly.sdkKey')
      .mockReturnValue('sometestkey');
    when(launchDarkly.init as jest.Mock)
      .mockReturnValue(launchDarkly.init(config.get('launchDarkly.sdkKey')));
    when(await client.waitForInitialization as jest.Mock)
      .mockResolvedValue(Promise.resolve({testFlag:true}));

    const featureFlags = new LaunchDarkly();
    const result = await featureFlags.getFlagValue(testFlag, false);

    expect(result).equal(true);
  });
});
