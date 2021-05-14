import {FactApi} from '../../../../main/app/fact/FactApi';
import {CourtGeneralInfo} from '../../../../main/types/CourtGeneralInfo';

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

  test('Should return downloadCourt results from get request ', async () => {
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

    await expect(api.getDownloadCourts()).resolves.toEqual(results.data);
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
        address: 'Address Street',
        'townName': 'AAA',
        postcode: 'AAA AAA',
      }],
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourt('London')).resolves.toEqual(results.data);
  });

  test('Should return results from getGeneralInfo request', async () => {
    const results: { data: CourtGeneralInfo } =
      { data: {
        open: true,
        'access_scheme': true,
        info: 'information',
        'info_cy': 'information_cy',
        alert: 'alert',
        'alert_cy': 'alert_cy',
        'in_person': true
      }
      };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getGeneralInfo('royal-courts-of-justice')).resolves.toEqual(results.data);
  });

  test('Should return rejected promise and log error from getGeneralInfo request', async () => {
    const error = new Error('Error') as any;
    error.response = {
      data: 'something failed',
      headers: {},
      status: 403,
      statusText: 'Failed'
    };

    const mockAxios = { get: async () => {
      throw error;
    }} as any;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getGeneralInfo('No Slug')).rejects.toBe(error);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getOpeningTimes request', async () => {
    const results = {
      data: [
        { description: 'Counter open', 'description_cy': 'Counter open welsh', hours: '9am to 4pm'}
      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimes('London')).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed getOpeningTimes request', async () => {
    const error = new Error('Error') as any;
    error.response = {
      data: 'something failed',
      headers: {},
      status: 403,
      statusText: 'Failed'
    };

    const mockAxios = { get: async () => {
      throw error;
    }} as any;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as any;
    const spy = jest.spyOn(mockLogger, 'info');

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimes('royal-courts-of-justice')).rejects.toBe(error);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getOpeningTimeDescriptions request', async () => {
    const results = {
      data: [
        { id: 1, name: 'Telephone enquiries answered', 'name_cy': 'Oriau ateb ymholiadau dros y ffôn' },
        { id: 2, name: 'Bailiff office open', 'name_cy': 'Oriau agor swyddfar Beiliaid' }
      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimeTypes()).resolves.toEqual(results.data);
  });

  test('Should return results from getEmails request', async () => {
    const results = {
      data: [
        {
          address: 'test address', explanation: 'explanation ',
          explanationCy: 'explanation cy', adminEmailTypeId: 8
        },
        {
          address: 'test address 2', explanation: 'explanation 2',
          explanationCy: 'explanation cy 2', adminEmailTypeId: 2
        }
      ]
    };

    const mockAxios = { get: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getEmails('Plymouth')).resolves.toEqual(results.data);
  });

  test('Should return results from getEmailTypes request', async () => {
    const results = {
      data: [
        {
          id: 1, description: 'Case progression', descriptionCy: 'Case progression cy'
        },
        {
          id: 2, description: 'Chancery', descriptionCy: 'Chancery cy' },
        {
          id: 3, description: 'Civil court', descriptionCy: 'Civil court cy'
        }]
    };

    const mockAxios = { get: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getEmailTypes()).resolves.toEqual(results.data);
  });

  test('Should update and return results from updateEmails request', async () => {
    const results = {
      data: [
        {
          address: 'test address', explanation: 'explanation ',
          explanationCy: 'explanation cy', adminEmailTypeId: 8
        },
        {
          address: 'test address 2', explanation: 'explanation 2',
          explanationCy: 'explanation cy 2', adminEmailTypeId: 2
        }
      ]
    };

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateEmails('Plymouth', results.data)).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getEmails request', async () => {

    const error = new Error('Error') as any;
    const mockAxios = {
      get: async () => {
        error.response = {
          data: 'something failed',
          headers: {},
          status: 403,
          statusText: 'Failed'
        };
        throw error;
      }
    } as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getEmails('No Slug')).rejects.toEqual(error);
  });

  test('Should log error and reject promise for failed getOpeningTimeDescriptions request', async () => {
    const error = new Error('Error') as any;
    error.response = {
      data: 'something failed',
      headers: {},
      status: 403,
      statusText: 'Failed'
    };

    const mockAxios = { get: async () => {
      throw error;
    }} as any;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimeTypes()).rejects.toBe(error);
  });

  test('Should return results and log error from getEmailTypes request', async () => {

    const error = new Error('Error') as any;
    const mockAxios = { get: async () => {
      error.response = {
        data: 'something failed',
        headers: {},
        status: 403,
        statusText: 'Failed'
      };
      throw error;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getEmailTypes()).rejects.toEqual(error);
  });

  test('Should return results and log error from updateEmails request', async () => {

    const error = new Error('Error') as any;
    const mockAxios = { put: async () => {
      error.response = {
        data: 'something failed',
        headers: {},
        status: 403,
        statusText: 'Failed'
      };
      throw error;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateEmails('No Slug', [])).rejects.toEqual(error);
  });
});
