import {Court} from '../../../../../main/types/Court';
import {NewCourtController} from '../../../../../main/app/controller/courts/NewCourtController';
import {CSRF} from '../../../../../main/modules/csrf';
import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';

describe('NewCourtController', () => {

  let mockApi: {
    addCourt: () => Promise<Court>
  };

  const controller = new NewCourtController();
  const getCourtData = {slug: 'mosh-court', name: '', nameCy: '', info: '',
    infoCy: '', open: true, inPerson: true, accessScheme: false,
    // eslint-disable-next-line @typescript-eslint/camelcase
    urgent_message: '', urgent_message_cy: ''
  };
  const getCourt: () => Court = () => getCourtData;

  beforeEach(() => {
    mockApi = {
      addCourt: async (): Promise<Court> => getCourt()
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    jest.spyOn(mockApi, 'addCourt');
  });

  test('Should get add court view and render the page', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'emptyValueFound': false,
      'errorMsg': [],
      'invalidLonOrLat': false,
      'latEntered': 0,
      'lonEntered': 0,
      'nameEntered': '',
      'nameValidationPassed': true,
      'redirectUrl': '',
      'serviceAreaChecked': false,
    });
  });

  test('Should not add new court if required fields are empty', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {

    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'emptyValueFound': true,
      'errorMsg':
        ['One or more mandatory fields are empty or have invalid values, please check allow and try again'],
      'invalidLonOrLat': true,
      'latEntered': 0,
      'lonEntered': 0,
      'nameEntered': '',
      'nameValidationPassed': true,
      'redirectUrl': '',
      'serviceAreaChecked': false,
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
      lat: '10'
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'emptyValueFound': true,
      'errorMsg':
        ['One or more mandatory fields are empty or have invalid values, please check allow and try again'],
      'invalidLonOrLat': true,
      'latEntered': '10',
      'lonEntered': 'abc',
      'nameEntered': 'mosh court',
      'nameValidationPassed': true,
      'redirectUrl': '',
      'serviceAreaChecked': true,
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
      lat: '10'
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'emptyValueFound': false,
      'errorMsg':
        ['Invalid court name: please amend and try again.'],
      'invalidLonOrLat': false,
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court @£@!£',
      'nameValidationPassed': false,
      'redirectUrl': '',
      'serviceAreaChecked': true,
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
      lat: '10'
    };
    req.scope.cradle.api = mockApi;
    CSRF.verify = jest.fn().mockReturnValue(false);

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'emptyValueFound': false,
      'errorMsg':
        ['A problem occurred when adding the new court'],
      'invalidLonOrLat': false,
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court',
      'nameValidationPassed': true,
      'redirectUrl': '',
      'serviceAreaChecked': true,
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
      lat: '10'
    };

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': false,
      'csrfToken': 'validCSRFToken',
      'emptyValueFound': false,
      'errorMsg':
        ['A court already exists for court provided: mosh court'],
      'invalidLonOrLat': false,
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court',
      'nameValidationPassed': true,
      'redirectUrl': '',
      'serviceAreaChecked': true,
    });
    expect(mockApi.addCourt).toBeCalledWith({'lat': '10', 'lon': '10',
      'new_court_name': 'mosh court', 'service_centre': true});
  });

  test('Should add new court success', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      newCourtName: 'mosh court',
      serviceCentre: 'true',
      lon: '10',
      lat: '10'
    };
    req.scope.cradle.api = mockApi;

    await controller.addNewCourt(req, res);

    expect(res.render).toBeCalledWith('courts/addNewCourt', {
      'created': true,
      'csrfToken': 'validCSRFToken',
      'emptyValueFound': false,
      'errorMsg': [],
      'invalidLonOrLat': false,
      'latEntered': '10',
      'lonEntered': '10',
      'nameEntered': 'mosh court',
      'nameValidationPassed': true,
      'redirectUrl': '/courts/mosh-court/edit#general',
      'serviceAreaChecked': true,
    });
    expect(mockApi.addCourt).toBeCalledWith({'lat': '10', 'lon': '10',
      'new_court_name': 'mosh court', 'service_centre': true});
  });
});
