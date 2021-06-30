import FeatureToggleService from '../../../../main/modules/featureToggle';
import {FeatureFlagClient} from '../../../../main/types/FeatureFlagClient';
import {when} from 'jest-when';
import {mockRequest} from '../../utils/mockRequest';
import {mockResponse} from '../../utils/mockResponse';
import Mock = jest.Mock;


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

  test('Should use feature-flag controller if flag is true', async () => {
    const mockReq = mockRequest();
    const mockRes = mockResponse();
    const mockNextController = jest.fn();
    let mockController: Mock;

    await new Promise((resolve) => {
      when(mockFeatureFlagClient.getFlagValue)
        .calledWith('test-feature-flag', false)
        .mockReturnValue(Promise.resolve(true));

      mockController = jest.fn(() => resolve());
      FeatureToggleService.toggleController('test-feature-flag', mockController, false)(mockReq, mockRes, mockNextController);
    }).then(() => {
      expect(mockFeatureFlagClient.getFlagValue).toBeCalledWith('test-feature-flag', false);
      expect(mockController).toBeCalledTimes(1);
      expect(mockNextController).toBeCalledTimes(0);
    });
  });

  test('Should use next controller if flag is set to false', async () => {
    const mockReq = mockRequest();
    const mockRes = mockResponse();
    const mockController = jest.fn();
    let mockNextController: Mock

    await new Promise((resolve) => {
      when(mockFeatureFlagClient.getFlagValue)
        .calledWith('test-feature-flag', false)
        .mockReturnValue(Promise.resolve(false));

      mockNextController = jest.fn(() => resolve());
      FeatureToggleService.toggleController('test-feature-flag', mockController, false)(mockReq, mockRes, mockNextController);
    }).then(() => {
      expect(mockFeatureFlagClient.getFlagValue).toBeCalledWith('test-feature-flag', false);
      expect(mockNextController).toBeCalledTimes(1);
      expect(mockController).toBeCalledTimes(0);
    });
  });
});
