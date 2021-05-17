import {FactApi} from '../../../../main/app/fact/FactApi';
import {CourtGeneralInfo} from '../../../../main/types/CourtGeneralInfo';
import {Contact} from '../../../../main/types/Contact';
import {ContactType} from '../../../../main/types/ContactType';
import {OpeningTime} from '../../../../main/types/OpeningTime';

describe('FactApi', () => {
  const mockError = new Error('Error') as any;
  mockError.response = {
    data: 'something failed',
    headers: {},
    status: 403,
    statusText: 'Failed'
  };

  const mockLogger = {
    error: (message: string) => message,
    info: (message: string) => message
  } as any;

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
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getDownloadCourts()).resolves.toEqual(results.data);
  });

  test('Should return no result and log error from get request', async () => {
    const mockAxios = { get: async () => {
      throw new Error('Error');
    }} as any;

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
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getGeneralInfo('royal-courts-of-justice')).resolves.toEqual(results.data);
  });

  test('Should return rejected promise and log error from getGeneralInfo request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getGeneralInfo('No Slug')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should log error and reject promise for failed updateGeneralInfo request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const mockBody: CourtGeneralInfo = {
      open: true,
      'in_person': true,
      'access_scheme': false,
      info: '',
      'info_cy': '',
      alert: '',
      'alert_cy': ''
    };

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateGeneralInfo('nottingham-crown-court', mockBody)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getOpeningTimes request', async () => {
    const results = {
      data: [
        { description: 'Counter open', 'description_cy': 'Counter open welsh', hours: '9am to 4pm'}
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimes('London')).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed getOpeningTimes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimes('royal-courts-of-justice')).rejects.toBe(mockError);
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
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimeTypes()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should log error and reject promise for failed updateOpeningTimes request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const mockBody: OpeningTime[] = [
      { 'type_id': 100, hours: '9:00am to 4:00pm'},
      { 'type_id': 23, hours: '10:00am to 3:00pm'}
    ];

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateOpeningTimes('nottingham-crown-court', mockBody)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getContacts request', async () => {
    const results: { data: Contact[]} = {
      data: [
        { 'type_id': 54, number: '0111 202 3030', fax: false, explanation: 'Bailiffs', 'explanation_cy': 'Translation' },
        { 'type_id': 43, number: '0987 6060 5050', fax: true, explanation: 'Explanation', 'explanation_cy': 'Exp in Welsh' }
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningTimes('royal-courts-of-justice')).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed getContacts request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getContacts('royal-courts-of-justice')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getContactTypes request', async () => {
    const results: { data: ContactType[] } = {
      data: [
        { id: 1, type: 'Chancery', 'type_cy': 'Siawnsri' },
        { id: 2, type: 'County Court', 'type_cy': 'Llys Sirol' }
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getContactTypes()).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed getContactTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getContactTypes()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should log error and reject promise for failed updateContacts request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const mockBody: Contact[] = [
      { 'type_id': 20, number: '0112 334 5543', fax: false, explanation: 'exp1', 'explanation_cy': 'exp1_cy' },
      { 'type_id': 11, number: '0223 445 6667', fax: true, explanation: 'exp2', 'explanation_cy': 'exp2_cy' }
    ];

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateContacts('newcastle-crown-court', mockBody)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results and log error from getEmailTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getEmailTypes()).rejects.toEqual(mockError);
  });

  test('Should return results and log error from updateEmails request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateEmails('No Slug', [])).rejects.toEqual(mockError);
  });
});
