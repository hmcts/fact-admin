import FeatureToggleService from '../../../../main/modules/featureToggle';
import {FeatureFlagClient} from '../../../../main/types/FeatureFlagClient';
import {when} from 'jest-when';


describe('FeatureToggleService', () => {
  const mockFeatureFlagClient: FeatureFlagClient = {
    getFlagValue: jest.fn(),
    getAllFlagValues: jest.fn(),
    onFlagChange: jest.fn((callback, defaultValue, flag) => {
      if(flag === undefined || flag === 'test-feature-flag-2') {
        callback();
      }
    })
  };

  new FeatureToggleService(mockFeatureFlagClient);


  test('Should return flag result', async () => {
    when(mockFeatureFlagClient.getFlagValue)
      .calledWith('test-feature-flag', false)
      .mockReturnValue(Promise.resolve(true));

    const testResult = await FeatureToggleService.getFlagValue('test-feature-flag');
    expect(mockFeatureFlagClient.getFlagValue).toBeCalled();
    expect(testResult).toBe(true);
  });

  test('Should return all flag values', async () => {
    const mockData = {
      'test-feature-flag-1': true,
      'test-feature-flag-2': false,
      'test-feature-flag-3': false
    };

    when(mockFeatureFlagClient.getAllFlagValues)
      .calledWith(false)
      .mockReturnValue(Promise.resolve(mockData));

    const testResult = await FeatureToggleService.getAllFlagValues();
    expect(mockFeatureFlagClient.getAllFlagValues).toBeCalled();
    expect(testResult).toBe(mockData);
  });

  test('Should call callback on any flag change', async () => {
    const mockCallback = jest.fn();

    FeatureToggleService.onFlagChange(mockCallback);
    expect(mockFeatureFlagClient.onFlagChange).toBeCalledWith(mockCallback, false, undefined);
    expect(mockCallback).toBeCalledTimes(1);
  });

  test('Should call callback on single flag change', async () => {
    const mockCallback = jest.fn();

    FeatureToggleService.onFlagChange(mockCallback, 'test-feature-flag-1', false);
    expect(mockFeatureFlagClient.onFlagChange).toBeCalledWith(mockCallback, false, 'test-feature-flag-1');
    expect(mockCallback).toBeCalledTimes(0);

    FeatureToggleService.onFlagChange(mockCallback, 'test-feature-flag-2', false);
    expect(mockFeatureFlagClient.onFlagChange).toBeCalledWith(mockCallback, false, 'test-feature-flag-2');
    expect(mockCallback).toBeCalledTimes(1);
  });
});
