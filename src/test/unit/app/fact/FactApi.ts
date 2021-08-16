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

  test('Should return results from getPostcodes request', async () => {
    const results = {
      data: ['PL1', 'PL2', 'PL3']
    };

    const mockAxios = { get: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getPostcodes('Plymouth')).resolves.toEqual(results.data);
  });

  test('Should add and return results from addPostcodes request', async () => {
    const results = {
      data: ['MOSH', 'KUPO']
    };

    const mockAxios = { post: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.addPostcodes('Plymouth', results.data)).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed addPostcodes request', async () => {
    const mockAxios = { post: async () => {
      throw mockError;
    }} as any;
    const results = {
      data: ['MOSH', 'KUPO']
    };

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.addPostcodes('Plymouth', results.data)).rejects.toEqual(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should delete and return results from deletePostcodes request', async () => {
    const results = {
      data: ['MOSH', 'KUPO']
    };

    const mockAxios = { delete: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.deletePostcodes('Plymouth', results.data)).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed deletePostcodes request', async () => {
    const mockAxios = { delete: async () => {
      throw mockError;
    }} as any;
    const results = {
      data: ['MOSH', 'KUPO']
    };

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deletePostcodes('Plymouth', results.data)).rejects.toEqual(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should move and return results from movePostcodes request', async () => {
    const results = {
      data: ['MOSH', 'KUPO']
    };

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.movePostcodes('Plymouth', 'Mosh Land',
      results.data)).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed movePostcodes request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;
    const results = {
      data: ['MOSH', 'KUPO']
    };

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.movePostcodes('Plymouth', 'Mosh Land',
      results.data)).rejects.toEqual(mockError);
    await expect(spy).toBeCalled();
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


  test('Should return results from getCourtTypes request', async () => {
    const results = {
      data: [
        { id: 1, name:"Magistrates' Court", code: 123},
        { id: 2, name:'Tribunal Court', code: 456}

      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtTypes()).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getCourtTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtTypes()).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getCourtTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtTypes()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getCourtCourtTypes request', async () => {
    const results = {
      data: [
        { id: 1, name:"Magistrates' Court", code: 123},
        { id: 2, name:'Tribunal Court', code: 456}

      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtCourtTypes('London')).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getCourtCourtTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtCourtTypes('No slug')).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getCourtCourtTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtCourtTypes('No Slug')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should update and return results from updateCourtCourtTypes request', async () => {
    const results = {
      data: [
        { id: 1, name:"Magistrates' Court", code: 123},
        { id: 2, name:'Tribunal Court', code: 456}

      ]
    };

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtCourtTypes('slug',[])).resolves.toEqual(results.data);
  });

  test('Should log error for failed updateCourtCourtTypes request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtCourtTypes('No Slug', [])).rejects.toEqual(mockError);
  });

  test('Should return results from getCourtAreasOfLaw request', async () => {
    const results = {
      data: [
        { id: 1, name:'Children'},
        { id: 2, name:'Divorce'}

      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtAreasOfLaw('No slug')).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getCourtAreasOfLaw request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtAreasOfLaw('No slug')).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getCourtAreasOfLaw request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtAreasOfLaw('No slug')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getAllLocalAuthorities request', async () => {
    const results = {
      data: [
        { id: 1, name:'Local Authority 1'},
        { id: 2, name:'Local Authority 2'}

      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllLocalAuthorities()).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getAllLocalAuthorities request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllLocalAuthorities()).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getAllLocalAuthorities request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllLocalAuthorities()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should update and return results from updateLocalAuthority request', async () => {
    const results = {
      data: [
        { id: 1, name:'Local Authority 1'},
        { id: 2, name:'Local Authority 2'}

      ]
    };

    const data = { id: 1, name:'Local Authority 1'};
    const id = 1;

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateLocalAuthority(id,data.name)).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed updateLocalAuthority request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const data = { id: 1, name:'Local Authority 1'};
    const id = 1;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateLocalAuthority(id,data.name)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });


  test('Should log error for failed updateLocalAuthority request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as never;

    const data = { id: 1, name:'Local Authority 1'};
    const id = 1;
    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateLocalAuthority(id,data.name)).rejects.toEqual(mockError);
  });

  test('Should return results from getCourtLocalAuthoritiesByAreaOfLaw request', async () => {
    const results = {
      data: [
        { id: 1, name:'Local Authority 1'},
        { id: 2, name:'Local Authority 2'}

      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtLocalAuthoritiesByAreaOfLaw('slug','areaOfLaw')).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getCourtLocalAuthoritiesByAreaOfLaw request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtLocalAuthoritiesByAreaOfLaw('slug','areaOfLaw')).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getCourtLocalAuthoritiesByAreaOfLaw request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtLocalAuthoritiesByAreaOfLaw('slug','areaOfLaw')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should log error for failed updateCourtLocalAuthoritiesByAreaOfLaw request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtLocalAuthoritiesByAreaOfLaw('slug','areaOfLaw',[])).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed updateCourtLocalAuthoritiesByAreaOfLaw request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateCourtLocalAuthoritiesByAreaOfLaw('slug','areaOfLaw',[])).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should update and return results from updateCourtLocalAuthoritiesByAreaOfLaw request', async () => {
    const results = {
      data: [
        { id: 1, name:'Local Authority 1'},
        { id: 2, name:'Local Authority 2'}

      ]
    };

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtLocalAuthoritiesByAreaOfLaw('slug','areaOfLaw',[])).resolves.toEqual(results.data);
  });

  test('Should return results from getAllAreasOfLaw request', async () => {
    const results = {
      data: [
        { id: 1, name: 'Area Of Law 1' },
        { id: 2, name: 'Area Of Law 2' }
      ]
    };

    const mockAxios = { get: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getAllAreasOfLaw()).resolves.toEqual(results.data);
  });

  test('Should log error for failed getAllAreasOfLaw request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllAreasOfLaw()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getCourtAreasOfLaw request', async () => {
    const results = {
      data: [
        { id: 1, name: 'Area Of Law 1' },
        { id: 2, name: 'Area Of Law 2' }
      ]
    };

    const mockAxios = { get: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getCourtAreasOfLaw('slug')).resolves.toEqual(results.data);
  });

  test('Should log error for failed getCourtAreasOfLaw request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtAreasOfLaw('slug')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from updateCourtAreasOfLaw request', async () => {
    const results = {
      data: [
        { id: 1, name: 'Area Of Law 1' },
        { id: 2, name: 'Area Of Law 2' }
      ]
    };

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtAreasOfLaw('slug',[])).resolves.toEqual(results.data);
  });

  test('Should log error for failed updateCourtAreasOfLaw request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateCourtAreasOfLaw('slug',[])).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

});
