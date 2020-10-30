import { FactApi } from '../../../../main/app/fact/FactApi';

describe('FactApi', () => {
  test('Should return results from get request', async () => {
    const results = {
      data: [{
        name: 'London',
        slug: 'London',
        address: 'Address Street',
        'townName': 'AAA',
        postcode: 'AAA AAA',
      }],
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourts()).resolves.toEqual(results.data);
  });

  test('Should return no result and log error from get request', async () => {
    const mockAxios = { get: async () => {
      throw new Error('Error');
    }} as any;
    const mockLogger = {
      error: async (message: string) => message
    } as any;

    const spy = jest.spyOn(mockLogger, 'error');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourts()).resolves.toEqual([]);
    await expect(spy).toBeCalled();

  });

  test('Should return results from getCourt request', async () => {
    const results = {
      data: [{
        name: 'London',
        slug: 'London',
        'last_modified': 'Address Street'
      }]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourt('London')).resolves.toEqual(results.data);
  });

  test('Should return no result and log error from getCourt request', async () => {
    const mockAxios = { get: async () => {
      const error = new Error('Error') as any;
      error.response = {
        data: 'something failed',
        headers: {},
        status: 403,
        statusText: 'Failed'
      };

      throw error;
    }} as any;
    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourt('No Slug')).resolves.toEqual({});
    await expect(spy).toBeCalled();

  });
});
