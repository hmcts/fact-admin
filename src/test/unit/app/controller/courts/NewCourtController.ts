import {Court} from '../../../../../main/types/Court';
import {NewCourtController} from '../../../../../main/app/controller/courts/NewCourtController';
import {CSRF} from '../../../../../main/modules/csrf';
import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {ServiceArea} from '../../../../../main/types/ServiceArea';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';
import {ServiceAreaCourt} from '../../../../../main/types/ServiceAreaCourt';

describe('NewCourtController', () => {

  let mockApi: {
    addCourt: () => Promise<Court>;
    getAllServiceAreas: () => Promise<ServiceArea[]>;
  };

  const controller = new NewCourtController();
  const getCourtData = {slug: 'mosh-court', name: '', nameCy: '', info: '',
    infoCy: '', open: true, inPerson: true, accessScheme: false,
    urgent_message: '', urgent_message_cy: ''
  };

  const getAreaOfLaw: (id: number, name: string) => AreaOfLaw =
    (id: number, name: string) => { return { id: id, name: name, 'display_name': null, 'display_name_cy': null, 'display_external_link': null,
      'external_link': null, 'external_link_desc': null, 'external_link_desc_cy': null, 'alt_name': null, 'alt_name_cy': null }; };

  const getServiceAreaCourt: (slug: string, catchmentType: string, courtName: string) => ServiceAreaCourt =
    (slug: string, catchmentType: string, courtName: string) => { return { 'slug': slug, 'catchmentType': catchmentType, 'courtName': courtName}; };

  const getAllServiceAreaCourts: ServiceAreaCourt[] = [
    getServiceAreaCourt('a-test-court', 'national', 'a test court'),
    getServiceAreaCourt('a-test-court-2', 'national', 'a test court 2'),
    getServiceAreaCourt('a-test-court-3', 'national', 'a test court 3'),
  ];

  const getServiceArea: (name: string, description: string, slug: string, serviceAreaType: string, onlineUrl: string,
                         onlineText: string, text: string) => ServiceArea =
    (name: string, description: string, slug: string, serviceAreaType: string, onlineUrl: string, onlineText: string, text: string) => {
      return {
        'name': name, 'description': description, 'slug': slug, 'serviceAreaType': serviceAreaType,
        'onlineUrl': onlineUrl, 'onlineText': onlineText, 'areaOfLawName': getAreaOfLaw(1, 'Adoption'),
        'serviceAreaCourts': getAllServiceAreaCourts, 'text': text};};

  const getAllServiceAreasData: ServiceArea[] = [
    getServiceArea('Housing', 'Tenant evictions and rent or mortgage disputes.', 'housing',
      'civil', 'a url', 'Make or respond to a possession claim online', null),
    getServiceArea('Childcare arrangements if you separate from your partner',
      'Making child arrangements if you divorce or separate.', 'childcare-arrangements',
      'family', 'a url 2', 'online text', null),
    getServiceArea('Other criminal offences', 'Criminal cases at a Crown or Magistrates\' Court',
      'major-criminal-offences', 'other', 'a url 2', 'online text',
      'We manage major criminal offences at our central service centre. Find where to send your documents or ask about your case.')
  ];
  const getCourt: () => Court = () => getCourtData;
  const getAllServiceAreas: () => ServiceArea[] = () => getAllServiceAreasData;

  beforeEach(() => {
    mockApi = {
      addCourt: async (): Promise<Court> => getCourt(),
      getAllServiceAreas: async (): Promise<ServiceArea[]> => getAllServiceAreas()
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    jest.spyOn(mockApi, 'addCourt');
  });

  test('Should get add court view and render the page', async () => {
    const req = mockRequest();
    const res = mockResponse();

    req.scope.cradle.api = mockApi;
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'formErrors': null,
      'latEntered': 0,
      'lonEntered': 0,
      'nameEntered': '',
      'redirectUrl': '',
      'serviceAreaChecked': false,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': [],
      'fatalError': false,
    });
  });

  test('Should not add new court if required fields are empty', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      newCourtName: '',
      serviceCentre: 'true',
      lon: '',
      lat: '',
      serviceAreaItems: []
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '',
      'lonEntered': '',
      'nameEntered': '',
      'redirectUrl': '',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': [],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': null
        },
        'latitudeError': {
          'text': 'A latitude value is required'
        },
        'longitudeError': {
          'text': 'A longitude value is required'
        },
        'nameError': {
          'text': 'A new court name value is required'
        },
        'serviceAreaError': {
          'text': 'At least one service area must be selected'
        }
      }
    });
    expect(mockApi.addCourt).not.toBeCalled();

  });

  test('Should not add new court if required fields are just whitespace', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      newCourtName: ' ',
      serviceCentre: 'false',
      lon: '\xa0',
      lat: '\t',
      serviceAreaItems: []
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '\t',
      'lonEntered': '\xa0',
      'nameEntered': ' ',
      'redirectUrl': '',
      'serviceAreaChecked': false,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': [],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': null
        },
        'latitudeError': {
          'text': 'A latitude value is required'
        },
        'longitudeError': {
          'text': 'A longitude value is required'
        },
        'nameError': {
          'text': 'A new court name value is required'
        },
        'serviceAreaError': {
          'text': null
        }
      }
    });
    expect(mockApi.addCourt).not.toBeCalled();

  });

  test('Should not add new court if a service centre and no areas added', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      newCourtName: 'mosh court',
      serviceCentre: 'true',
      lon: '98',
      lat: '1',
      serviceAreaItems: []
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '1',
      'lonEntered': '98',
      'nameEntered': 'mosh court',
      'redirectUrl': '',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': [],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': null
        },
        'latitudeError': {
          'text': null
        },
        'longitudeError': {
          'text': null
        },
        'nameError': {
          'text': null
        },
        'serviceAreaError': {
          'text': 'At least one service area must be selected'
        }
      }
    });
    expect(mockApi.addCourt).not.toBeCalled();

  });

  test('Should not add new court if required lon or lat are not a number', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      newCourtName: 'mosh court',
      serviceCentre: 'true',
      lon: 'abc',
      lat: '!!',
      serviceAreaItems: ['one', 'two', 'three']
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '!!',
      'lonEntered': 'abc',
      'nameEntered': 'mosh court',
      'redirectUrl': '',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': ['one', 'two', 'three'],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': null
        },
        'latitudeError': {
          'text': 'The latitude value needs to be a number'
        },
        'longitudeError': {
          'text': 'The longitude value needs to be a number'
        },
        'nameError': {
          'text': null
        },
        'serviceAreaError': {
          'text': null
        }
      }
    });
    expect(mockApi.addCourt).not.toBeCalled();

  });

  test('Should not add new court if name has invalid symbols', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      newCourtName: 'mosh court @£@!£',
      serviceCentre: 'true',
      lon: '10',
      lat: '10',
      serviceAreaItems: ['one', 'two', 'three']
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court @£@!£',
      'redirectUrl': '',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': ['one', 'two', 'three'],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': null
        },
        'latitudeError': {
          'text': null
        },
        'longitudeError': {
          'text': null
        },
        'nameError': {
          'text': 'Invalid court name: Valid characters are: A-Z, a-z, 0-9, apostrophes, brackets and hyphens'
        },
        'serviceAreaError': {
          'text': null
        }
      }
    });
    expect(mockApi.addCourt).not.toBeCalled();
  });

  test('Should not add new court if csrf token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      newCourtName: 'mosh court',
      serviceCentre: 'true',
      lon: '10',
      lat: '10',
      serviceAreaItems: ['one', 'two', 'three']
    };
    req.scope.cradle.api = mockApi;
    CSRF.verify = jest.fn().mockReturnValue(false);

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court',
      'redirectUrl': '',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': ['one', 'two', 'three'],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': 'A problem occurred when adding the new court.'
        },
        'latitudeError': {
          'text': null
        },
        'longitudeError': {
          'text': null
        },
        'nameError': {
          'text': null
        },
        'serviceAreaError': {
          'text': null
        }
      }
    });
    expect(mockApi.addCourt).not.toBeCalled();
  });

  test('Should not add new court if conflict error from api', async() => {
    const res = mockResponse();
    const req = mockRequest();
    const errorResponse = mockResponse();
    errorResponse.response.data = {};
    errorResponse.response.status = 409;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.addCourt = jest.fn().mockRejectedValue(errorResponse);
    req.body = {
      newCourtName: 'mosh court',
      serviceCentre: 'true',
      lon: '10',
      lat: '10',
      serviceAreaItems: ['one', 'two', 'three']
    };

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court',
      'redirectUrl': '',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': ['one', 'two', 'three'],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': 'A court already exists for court provided: mosh court'
        },
        'latitudeError': {
          'text': null
        },
        'longitudeError': {
          'text': null
        },
        'nameError': {
          'text': null
        },
        'serviceAreaError': {
          'text': null
        }
      }
    });
    expect(mockApi.addCourt).toBeCalledWith({'lat': '10', 'lon': '10',
      'new_court_name': 'mosh court', 'service_centre': true,
      'service_areas': ['one', 'two', 'three']});
  });

  test('Should add new court success', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      newCourtName: 'mosh court',
      serviceCentre: 'true',
      lon: '10',
      lat: '10',
      serviceAreaItems: ['one', 'two', 'three']
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': true,
      'csrfToken': 'validCSRFToken',
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court',
      'redirectUrl': '/courts/mosh-court/edit#general',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': ['one', 'two', 'three'],
      'fatalError': false,
      'formErrors': null
    });
    expect(mockApi.addCourt).toBeCalledWith({'lat': '10', 'lon': '10',
      'new_court_name': 'mosh court', 'service_centre': true,
      'service_areas': ['one', 'two', 'three']});
  });

  test('Should expect errors that have been fixed to not be present in form errors object', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      newCourtName: 'mosh court @£@!£',
      serviceCentre: 'true',
      lon: '@@',
      lat: '10',
      serviceAreaItems: ['one', 'two', 'three']
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'latEntered': '10',
      'lonEntered': '@@',
      'nameEntered': 'mosh court @£@!£',
      'redirectUrl': '',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': ['one', 'two', 'three'],
      'fatalError': false,
      'formErrors': {
        'addCourtError': {
          'text': null
        },
        'latitudeError': {
          'text': null
        },
        'longitudeError': {
          'text': 'The longitude value needs to be a number'
        },
        'nameError': {
          'text': 'Invalid court name: Valid characters are: A-Z, a-z, 0-9, apostrophes, brackets and hyphens'
        },
        'serviceAreaError': {
          'text': null
        }
      }
    });
    expect(mockApi.addCourt).not.toBeCalled();

    //request again with valid inputs
    req.body = {
      newCourtName: 'mosh court',
      serviceCentre: 'true',
      lon: '10',
      lat: '10',
      serviceAreaItems: ['one', 'two', 'three']
    };

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': true,
      'csrfToken': 'validCSRFToken',
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court',
      'redirectUrl': '/courts/mosh-court/edit#general',
      'serviceAreaChecked': true,
      'allServiceAreas': getAllServiceAreas(),
      'serviceAreas': ['one', 'two', 'three'],
      'fatalError': false,
      'formErrors': null
    });
    expect(mockApi.addCourt).toBeCalledWith({'lat': '10', 'lon': '10',
      'new_court_name': 'mosh court', 'service_centre': true,
      'service_areas': ['one', 'two', 'three']});
  });
});
