import {FactApi} from '../../../../main/app/fact/FactApi';
import {CourtGeneralInfo} from '../../../../main/types/CourtGeneralInfo';
import {Contact} from '../../../../main/types/Contact';
import {ContactType} from '../../../../main/types/ContactType';
import {OpeningTime} from '../../../../main/types/OpeningTime';
import {CourtAddress} from '../../../../main/types/CourtAddress';
import {AreaOfLaw} from '../../../../main/types/AreaOfLaw';
import {FacilityType} from '../../../../main/types/Facility';
import {AdditionalLink} from '../../../../main/types/AdditionalLink';
import {Action, Audit} from '../../../../main/types/Audit';
import {OpeningType} from '../../../../main/types/OpeningType';
import {NewCourt} from '../../../../main/types/NewCourt';

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
        name: 'court name',
        open: true,
        'access_scheme': true,
        info: 'information',
        'info_cy': 'information_cy',
        alert: 'alert',
        'alert_cy': 'alert_cy',
        'in_person': true,
        'sc_intro_paragraph': '',
        'sc_intro_paragraph_cy': ''
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
      name: 'court name',
      open: true,
      'in_person': true,
      'access_scheme': false,
      info: '',
      'info_cy': '',
      alert: '',
      'alert_cy': '',
      'sc_intro_paragraph': '',
      'sc_intro_paragraph_cy': ''
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

  test('Should add and return result from addCourt request', async () => {
    const results = {
      data: {}
    };

    const mockAxios = { post: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.addCourt({
      new_court_name: 'a new court name',
      service_centre: 'a new court service centre',
      lon: 10,
      lat: 12
    } as unknown as NewCourt)).resolves.toEqual(results.data);
  });


  test('Should log error and reject promise for failed addCourts request', async () => {
    const mockAxios = { post: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.addCourt({
      new_court_name: 'a new court name',
      service_centre: 'a new court service centre',
      lon: 10,
      lat: 12
    } as unknown as NewCourt)).rejects.toEqual(mockError);
    await expect(spy).toBeCalled();
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

  test('Should update and return results from updateCourtFacility request', async () => {
    const results = {
      data: [
        { name:'Facility1', description: 'description1', descriptionCy: 'descriptionCy1' },
        { name:'Facility2', description: 'description2', descriptionCy: 'descriptionCy2' }
      ]
    };

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtFacilities('slug',[])).resolves.toEqual(results.data);
  });


  test('Should log error for failed updateCourtFacility request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtFacilities('slug',[])).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed updateCourtFacility request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateCourtFacilities('slug',[])).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getCourtFacilities request', async () => {
    const results = {
      data: [
        { name:'Facility1', description: 'description1', descriptionCy: 'descriptionCy1' },
        { name:'Facility2', description: 'description2', descriptionCy: 'descriptionCy2' }
      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtFacilities('slug')).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getCourtFacilities request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtFacilities('slug')).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getCourtFacilities request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtFacilities('slug')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getAllFacilityTypes request', async () => {
    const results = {
      data: [
        { id: 1, name: 'Facility1'},
        { id: 2, name: 'Facility2'}
      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllFacilityTypes()).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getAllFacilityTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllFacilityTypes()).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getAllFacilityTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllFacilityTypes()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
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

  test('Should return results from getCourtTypesAndCodes request', async () => {
    const results = {
      data: [
        { id: 1, name:"Magistrates' Court", code: 123},
        { id: 2, name:'Tribunal Court', code: 456}

      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtTypesAndCodes('London')).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getCourtTypesAndCodes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtTypesAndCodes('No slug')).rejects.toEqual(mockError);
  });

  test('Should log error and reject promise for failed getCourtCourtTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtTypesAndCodes('No Slug')).rejects.toBe(mockError);
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
    await expect(api.updateCourtTypesAndCodes('slug',null)).resolves.toEqual(results.data);
  });

  test('Should log error for failed updateCourtTypesAndCodes request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtTypesAndCodes('No Slug', null)).rejects.toEqual(mockError);
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

    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllAreasOfLaw()).rejects.toBe(mockError);
    await expect(loggerSpy).toBeCalled();
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

    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getCourtAreasOfLaw('slug')).rejects.toBe(mockError);
    await expect(loggerSpy).toBeCalled();
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

    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtAreasOfLaw('slug',[])).rejects.toBe(mockError);
    await expect(loggerSpy).toBeCalled();
  });




  test('Should return results from getAddressTypes request', async () => {
    const results = {
      data: [
        { id: 100, name:'Visit us'},
        { id: 200, name:'Write to us'},
        { id: 200, name:'Visit or contact us'},
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAddressTypes()).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed getAddressTypes request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getAddressTypes()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getCourtAddresses request', async () => {
    const results: { data: CourtAddress[] } = {
      data: [
        { 'type_id': 100, 'address_lines': ['100 Green Street'], 'address_lines_cy': [], town: 'Red Town', 'town_cy': '', postcode: 'AB1 2CD' },
        { 'type_id': 200, 'address_lines': ['122 Green Street'], 'address_lines_cy': [], town: 'Red Town', 'town_cy': '', postcode: 'AB1 2XZ' }
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtAddresses('newcastle-crown-court')).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed getCourtAddresses request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getCourtAddresses('newcastle-crown-court')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should update court addresses and return results from updateCourtAddresses request', async () => {
    const addresses: { data: CourtAddress[] } = {
      data: [
        { 'type_id': 100, 'address_lines': ['100 Green Street'], 'address_lines_cy': [], town: 'Red Town', 'town_cy': '', postcode: 'AB1 2CD' },
        { 'type_id': 200, 'address_lines': ['122 Green Street'], 'address_lines_cy': [], town: 'Red Town', 'town_cy': '', postcode: 'AB1 2XZ' }
      ]
    };
    const mockAxios = { put: async () => addresses } as any;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtAddresses('newcastle-crown-court', addresses.data)).resolves.toEqual(addresses.data);
  });

  test('Should log error and reject promise for failed updateCourtAddresses request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtAddresses('newcastle-crown-court', [])).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return results from getAreasOfLaw request', async () => {
    const results: { data: AreaOfLaw[] } = {
      data: [
        { id: 100, name: 'Divorce', 'alt_name': 'Divorce hearings', 'alt_name_cy': 'Gwrandawiadau ysgariad',
          'external_link': 'https%3A//www.gov.uk/divorce', 'external_link_desc': '', 'external_link_desc_cy': '',
          'display_name': 'DIVORCE', 'display_name_cy': '', 'display_external_link': 'https%3A//www.gov.uk/divorce' }
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAreasOfLaw()).resolves.toEqual(results.data);
  });

  test('Should return results from getAreaOfLaw request', async () => {
    const result: { data: AreaOfLaw } = {
      data: { id: 1224, name: 'Divorce', 'alt_name': 'Divorce hearings', 'alt_name_cy': 'Gwrandawiadau ysgariad',
        'external_link': 'https%3A//www.gov.uk/divorce', 'external_link_desc': '', 'external_link_desc_cy': '',
        'display_name': 'DIVORCE', 'display_name_cy': '', 'display_external_link': 'https%3A//www.gov.uk/divorce'
      }};
    const mockAxios = { get: async () => result } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAreaOfLaw('1224')).resolves.toEqual(result.data);
  });

  test('Should update area of law and return area of law from updateAreaOfLaw request', async () => {
    const result: { data: AreaOfLaw } = {
      data: { id: 1224, name: 'Divorce', 'alt_name': 'Divorce hearings', 'alt_name_cy': 'Gwrandawiadau ysgariad',
        'external_link': 'https%3A//www.gov.uk/divorce', 'external_link_desc': '', 'external_link_desc_cy': '',
        'display_name': 'DIVORCE', 'display_name_cy': '', 'display_external_link': 'https%3A//www.gov.uk/divorce'
      }};
    const mockAxios = { put: async () => result } as any;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateAreaOfLaw(result.data)).resolves.toEqual(result.data);
  });

  test('Should create area of law and return area of law from createAreaOfLaw request', async () => {
    const result: { data: AreaOfLaw } = {
      data: { id: 1224, name: 'Divorce', 'alt_name': 'Divorce hearings', 'alt_name_cy': 'Gwrandawiadau ysgariad',
        'external_link': 'https%3A//www.gov.uk/divorce', 'external_link_desc': '', 'external_link_desc_cy': '',
        'display_name': 'DIVORCE', 'display_name_cy': '', 'display_external_link': 'https%3A//www.gov.uk/divorce'
      }};
    const mockAxios = { post: async () => result } as any;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.createAreaOfLaw(result.data)).resolves.toEqual(result.data);
  });

  test('Should log error and reject promise for failed getAreasOfLaw request', async () => {
    const mockAxios = { get: async () => { throw mockError; }} as any;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAreasOfLaw()).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should log error and reject promise for failed getAreaOfLaw request', async () => {
    const mockAxios = { get: async () => { throw mockError; }} as any;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAreaOfLaw('1222')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should log error and reject promise for failed createAreaOfLaw request', async () => {
    const aol: AreaOfLaw = {
      id: 1224, name: 'Divorce', 'alt_name': 'Divorce hearings', 'alt_name_cy': 'Gwrandawiadau ysgariad',
      'external_link': 'https%3A//www.gov.uk/divorce', 'external_link_desc': '', 'external_link_desc_cy': '',
      'display_name': 'DIVORCE', 'display_name_cy': '', 'display_external_link': 'https%3A//www.gov.uk/divorce'
    };

    const mockAxios = { post: async () => { throw mockError; }} as any;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.createAreaOfLaw(aol)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should log error and reject promise for failed updateAreaOfLaw request', async () => {
    const aol: AreaOfLaw = {
      id: 1224, name: 'Divorce', 'alt_name': 'Divorce hearings', 'alt_name_cy': 'Gwrandawiadau ysgariad',
      'external_link': 'https%3A//www.gov.uk/divorce', 'external_link_desc': '', 'external_link_desc_cy': '',
      'display_name': 'DIVORCE', 'display_name_cy': '', 'display_external_link': 'https%3A//www.gov.uk/divorce'
    };

    const mockAxios = { put: async () => { throw mockError; }} as any;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateAreaOfLaw(aol)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should delete area of law', async () => {
    const id = '100';
    const result = { data: id };
    const mockAxios = { delete: async () => Promise.resolve(result) } as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteAreaOfLaw(id)).resolves.toBe(id);
  });

  test('Should log error and reject promise for failed deleteAreaOfLaw request ', async () => {
    const mockAxios = { delete: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteAreaOfLaw('100')).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should return results from getContactType request', async () => {
    const result: { data: ContactType } = {
      data: { id: 123, type: 'Admin', 'type_cy': ''}};
    const mockAxios = { get: async () => result } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getContactType('123')).resolves.toEqual(result.data);
  });

  test('Should log error and reject promise for failed getContactType request', async () => {
    const mockAxios = { get: async () => { throw mockError; }} as any;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getContactType('123')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should update contact type and return updated contact type', async () => {
    const result: { data: ContactType } = {
      data: { id: 123, type: 'Admin', 'type_cy': ''}};
    const mockAxios = { put: async () => result } as any;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateContactType(result.data)).resolves.toEqual(result.data);
  });

  test('Should log error and reject promise for failed updateContactType request', async () => {
    const ct: { data: ContactType } = {
      data: { id: 123, type: 'Admin', 'type_cy': ''}};

    const mockAxios = { put: async () => { throw mockError; }} as any;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateContactType(ct.data)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });


  test('Should create contact type and return created contact type', async () => {
    const result: { data: ContactType } = {
      data: { id: 123, type: 'Admin', 'type_cy': ''}};
    const mockAxios = { post: async () => result } as any;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.createContactType(result.data)).resolves.toEqual(result.data);
  });

  test('Should log error and reject promise for failed createContactType request', async () => {
    const ct: { data: ContactType } = {
      data: { id: 123, type: 'Admin', 'type_cy': ''}};

    const mockAxios = { post: async () => { throw mockError; }} as any;
    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.createContactType(ct.data)).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should delete contact type', async () => {
    const id = '100';
    const result = { data: id };
    const mockAxios = { delete: async () => Promise.resolve(result) } as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteContactType(id)).resolves.toBe(id);
  });

  test('Should log error and reject promise for failed deleteContactType request ', async () => {
    const mockAxios = { delete: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteContactType('100')).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should return results from getAllFacilityTypes request', async () => {
    const results: { data: FacilityType[] } = {
      data: [
        { id: 100, name: 'Test FT 1', nameCy: 'Test FT 1 cy', order: 1 },
        { id: 200, name: 'Test FT 2', nameCy: 'Test FT 2 cy', order: 2 },
        { id: 300, name: 'Test FT 3', nameCy: 'Test FT 3 cy', order: 3 }
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllFacilityTypes()).resolves.toEqual(results.data);

  });

  test('Should return results from getCourtAdditionalLinks request', async () => {
    const results: { data: AdditionalLink[] } = {
      data: [
        { 'url': 'http://www.test1.com', 'display_name': 'Test site 1', 'display_name_cy': 'Test site 1 cy' },
        { 'url': 'http://www.test2.com', 'display_name': 'Test site 2', 'display_name_cy': 'Test site 2 cy' }
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getAllFacilityTypes()).resolves.toEqual(results.data);
  });

  test('Should return results from getFacilityType request', async () => {
    const results: { data: FacilityType } = {
      data: { id: 100, name: 'Test FT 1', nameCy: 'Test FT 1 cy', order: 1 }
    };
    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getFacilityType('100')).resolves.toEqual(results.data);
  });

  test('Should create facility type and return facility type from createFacilityType request', async () => {
    const results: { data: FacilityType } = {
      data: { id: 300, name: 'Test FT 1', nameCy: 'Test FT 1 cy', order: 1 }
    };
    const mockAxios = { post: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.createFacilityType(results.data)).resolves.toEqual(results.data);
  });

  test('Should update facility type and return facility type from updateFacilityType request', async () => {
    const results: { data: FacilityType } = {
      data: { id: 500, name: 'Test FT 1', nameCy: 'Test FT 1 cy', order: 1 }
    };
    const mockAxios = { put: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateFacilityType(results.data)).resolves.toEqual(results.data);
  });

  test('Should delete facility type and return ID of deleted entity from deleteFacilityType request', async () => {
    const results: { data: number } = {
      data: 500
    };
    const mockAxios = { delete: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteFacilityType('500')).resolves.toEqual(results.data);
  });

  test('Should reorder facility types and return updated facility types from reorderFacilityTypes request', async () => {
    const idsInOrder = ['300', '100', '200'];
    const results: { data: FacilityType[] } = {
      data: [
        { id: 100, name: 'Test FT 1', nameCy: 'Test FT 1 cy', order: 2 },
        { id: 200, name: 'Test FT 2', nameCy: 'Test FT 2 cy', order: 3 },
        { id: 300, name: 'Test FT 3', nameCy: 'Test FT 3 cy', order: 1 }
      ]
    };
    const mockAxios = { put: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.reorderFacilityTypes(idsInOrder)).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed getFacilityTypes request ', async () => {
    const mockAxios = { get: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAllFacilityTypes()).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should log error and reject promise for failed getFacilityType request ', async () => {
    const mockAxios = { get: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getFacilityType('100')).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should log error and reject promise for failed createFacilityType request ', async () => {
    const mockAxios = { post: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.createFacilityType({ id: null, name: 'Test FT', nameCy: 'Test FT cy' })).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should log error and reject promise for failed updateFacilityType request ', async () => {
    const mockAxios = { put: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateFacilityType({ id: 4321, name: 'Test FT', nameCy: 'Test FT cy' })).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should log error and reject promise for failed deleteFacilityType request ', async () => {
    const mockAxios = { delete: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteFacilityType('3321')).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should log error and reject promise for failed getCourtAdditionalLinks request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtAdditionalLinks('newcastle-crown-court')).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should update court additional links and return results from updateCourtAdditionalLinks request', async () => {
    const additionalLinks: { data: AdditionalLink[] } = {
      data: [
        { 'url': 'http://www.test1.com', 'display_name': 'Test site 1', 'display_name_cy': 'Test site 1 cy' },
        { 'url': 'http://www.test2.com', 'display_name': 'Test site 2', 'display_name_cy': 'Test site 2 cy' }
      ]
    };
    const mockAxios = { put: async () => additionalLinks } as any;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtAdditionalLinks('newcastle-crown-court', additionalLinks.data)).resolves.toEqual(additionalLinks.data);
  });

  test('Should log error and reject promise for failed updateCourtAdditionalLinks request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const spy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateCourtAdditionalLinks('newcastle-crown-court', [])).rejects.toBe(mockError);
    await expect(spy).toBeCalled();
  });

  test('Should return audits', async () => {
    const results: { data: Audit[] } = {
      data: [
        { id: 1, action: { name: 'test', id : 1  } as Action,
          // eslint-disable-next-line @typescript-eslint/camelcase
          creation_time: 'a time', action_data_after: 'data after', action_data_before: 'data before', location: 'location', user_email: 'user email'}
      ]
    };
    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAudits(1, 1, 'location', 'email', 'date from', 'date to'))
      .resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed get audits request', async () => {
    const mockAxios = { get: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getAudits(1, 1, 'location', 'email', 'date from', 'date to'))
      .rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should return image file name from getCourtImage request', async () => {
    const results = {
      data: [
        { name: 'image-file.jpeg' }
      ]
    };

    const mockAxios = { get: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.getCourtImage('slug')).resolves.toEqual(results.data);
  });

  test('Should log error for failed getCourtImage request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as any;

    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getCourtImage('slug')).rejects.toBe(mockError);
    await expect(loggerSpy).toBeCalled();
  });

  test('Should update image file name for updateCourtImage request', async () => {
    const results = {
      data: [
        { name: 'image-file.jpeg' }
      ]
    };

    const mockAxios = { put: async () => results } as never;
    const mockLogger = {} as never;
    const api = new FactApi(mockAxios, mockLogger);
    await expect(api.updateCourtImage('slug', {name: 'image-file.jpeg'})).resolves.toEqual(results.data);
  });

  test('Should log error for failed updateCourtImage request', async () => {
    const mockAxios = { put: async () => {
      throw mockError;
    }} as any;

    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateCourtImage('slug', {name: 'image-file.jpeg'})).rejects.toBe(mockError);
    await expect(loggerSpy).toBeCalled();
  });

  test('Should return results from getOpeningType request', async () => {
    const results = {
      data: [
        { id: 1, type: 'Opening1', 'type_cy': 'Opening1_cy' },
      ]
    };

    const mockAxios = { get: async () => results } as any;
    const mockLogger = {} as any;

    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningType('1')).resolves.toEqual(results.data);
  });

  test('Should return results and log error from getOpeningType request', async () => {
    const mockAxios = { get: async () => {
      throw mockError;
    }} as never;

    const mockLogger = {
      error: (message: string) => message,
      info: (message: string) => message
    } as never;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.getOpeningType('1')).rejects.toEqual(mockError);
  });

  test('Should create opening type and return facility type from createOpeningType request', async () => {
    const results: { data: OpeningType } = {
      data: { id: 300, type: 'Opening 1', 'type_cy': 'Opening 1 cy' }
    };
    const mockAxios = { post: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.createOpeningType(results.data)).resolves.toEqual(results.data);
  });

  test('Should update opening type and return updateOpeningType request', async () => {
    const results: { data: OpeningType } = {
      data: { id: 500, type: 'Opening 1', 'type_cy': 'Opening 1 cy' }
    };
    const mockAxios = { put: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateOpeningType(results.data)).resolves.toEqual(results.data);
  });

  test('Should delete opening type  from deleteOpeningType request', async () => {
    const results: { data: number } = {
      data: 500
    };
    const mockAxios = { delete: async () => results } as any;
    const mockLogger = {} as any;
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteOpeningType('500')).resolves.toEqual(results.data);
  });

  test('Should log error and reject promise for failed createOpeningType request ', async () => {
    const mockAxios = { post: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.createOpeningType({ id: null, type: 'Opening 1', 'type_cy': 'Opening 1 cy' })).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should log error and reject promise for failed updateOpeningType request ', async () => {
    const mockAxios = { put: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.updateOpeningType({ id: 4321, type: 'Opening 1', 'type_cy': 'Opening 1 cy' })).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

  test('Should log error and reject promise for failed deleteOpeningType request ', async () => {
    const mockAxios = { delete: async () => { throw mockError; } } as any;
    const loggerSpy = jest.spyOn(mockLogger, 'info');
    const api = new FactApi(mockAxios, mockLogger);

    await expect(api.deleteFacilityType('3321')).rejects.toBe(mockError);
    expect(loggerSpy).toBeCalled();
  });

});
