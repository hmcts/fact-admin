import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CourtGeneralInfo, CourtGeneralInfoData} from '../../../../../main/types/CourtGeneralInfo';
import {GeneralInfoController} from '../../../../../main/app/controller/courts/GeneralInfoController';
import {CSRF} from '../../../../../main/modules/csrf';

describe('GeneralInfoController', () => {

  let mockApi: {
    getGeneralInfo: () => Promise<CourtGeneralInfo>,
    updateGeneralInfo: () => Promise<CourtGeneralInfo>
  };

  const courtGeneralInfo: CourtGeneralInfo = {
    name: 'court name',
    open: true,
    'access_scheme': false,
    info: 'info',
    'info_cy': 'info cy',
    alert: 'an alert',
    'alert_cy': 'an alert cy',
    'in_person': true
  };

  const courtGeneralInfoBlankNameField: CourtGeneralInfo = {
    name: '',
    open: true,
    'access_scheme': false,
    info: 'info',
    'info_cy': 'info cy',
    alert: 'an alert',
    'alert_cy': 'an alert cy',
    'in_person': true
  };

  const controller = new GeneralInfoController();

  beforeEach(() => {
    mockApi = {
      getGeneralInfo: async (): Promise<CourtGeneralInfo> => courtGeneralInfo,
      updateGeneralInfo: async (): Promise<CourtGeneralInfo> => courtGeneralInfo,
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get court general info and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: courtGeneralInfo,
      errorMsg: '',
      updated: false,
      duplicatedName: false
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should put court general info', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = {
      ...courtGeneralInfo,
      _csrf: CSRF.create()
    };

    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateGeneralInfo = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    expect(mockApi.updateGeneralInfo).toBeCalledWith(slug, {...courtGeneralInfo, _csrf: CSRF.create()});
  });

  test('Should not put court general info if CSRF token is invalid', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = {
      ...courtGeneralInfo,
      _csrf: CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateGeneralInfo = jest.fn().mockResolvedValue(res);
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    const expectedResults: CourtGeneralInfoData = {
      generalInfo: {
        ...courtGeneralInfo,
        _csrf: CSRF.create()
      },
      errorMsg: controller.updateGeneralInfoErrorMsg,
      updated: false,
      duplicatedName: false
    } as CourtGeneralInfoData;
    await controller.put(req, res);

    //expect(mockApi.updateGeneralInfo).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResults);
  });

  test('Should not put court general info if name is left blank', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = {
      ...courtGeneralInfoBlankNameField,
      _csrf: CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateGeneralInfo = jest.fn().mockResolvedValue(res);

    const expectedResults: CourtGeneralInfoData = {
      generalInfo: {
        ...courtGeneralInfoBlankNameField,
        _csrf: CSRF.create()
      },
      errorMsg: controller.updateGeneralInfoErrorMsg,
      updated: false,
      duplicatedName: false
    } as CourtGeneralInfoData;
    await controller.put(req, res);

    //expect(mockApi.updateGeneralInfo).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResults);
  });

  test('Should handle errors when getting court general info from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getGeneralInfo = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    const res = mockResponse();

    await controller.get(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: null,
      errorMsg: controller.getGeneralInfoErrorMsg,
      updated: false,
      duplicatedName: false
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should handle errors when posting court general info to API', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500;
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = courtGeneralInfo;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateGeneralInfo = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: courtGeneralInfo,
      errorMsg: controller.updateGeneralInfoErrorMsg,
      updated: false,
      duplicatedName: false
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should handle errors when posting court general info to with a duplicate name', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 409;
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = courtGeneralInfo;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateGeneralInfo = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: courtGeneralInfo,
      errorMsg: controller.updateDuplicateGeneralInfoErrorMsg + undefined,
      updated: false,
      duplicatedName: true
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });
});
