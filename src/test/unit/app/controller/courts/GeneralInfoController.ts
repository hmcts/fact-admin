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
    'in_person': true,
    'service_centre': false,
    'sc_intro_paragraph': '',
    'sc_intro_paragraph_cy': ''
  };

  const courtGeneralInfoBlankNameField: CourtGeneralInfo = {
    name: '',
    open: true,
    'access_scheme': false,
    info: 'info',
    'info_cy': 'info cy',
    alert: 'an alert',
    'alert_cy': 'an alert cy',
    'in_person': true,
    'service_centre': false,
    'sc_intro_paragraph': '',
    'sc_intro_paragraph_cy': ''
  };

  const courtGeneralInfoInvalidCharacters: CourtGeneralInfo = {
    name: 'invalid name!',
    open: true,
    'access_scheme': false,
    info: 'info',
    'info_cy': 'info cy',
    alert: 'an alert',
    'alert_cy': 'an alert cy',
    'in_person': true,
    'service_centre': false,
    'sc_intro_paragraph': '',
    'sc_intro_paragraph_cy': ''
  };

  const courtGeneralInfoTooManyCharsForIntroParagraph: CourtGeneralInfo = {
    name: 'court name',
    open: true,
    'access_scheme': false,
    info: 'info',
    'info_cy': 'info cy',
    alert: 'an alert',
    'alert_cy': 'an alert cy',
    'in_person': true,
    'service_centre': true,
    'sc_intro_paragraph': 'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20',
    'sc_intro_paragraph_cy': 'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 ' +
      'intro paragraph 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20'
  };

  const courtGeneralInfoOverCharacterLimit: CourtGeneralInfo = {
    name: '',
    open: true,
    'access_scheme': false,
    info: 'info',
    'info_cy': 'info cy',
    alert: 'Urgent notice 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20. ' +
      'Urgent notice 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20. ' +
      'Urgent notice 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20. ' +
      'Urgent notice 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20. ' +
      'Urgent notice 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20. ' +
      'Urgent notice 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20. ' +
      'Urgent notice 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20. ',
    'alert_cy': 'an alert cy',
    'in_person': true,
    'service_centre': false,
    'sc_intro_paragraph': '',
    'sc_intro_paragraph_cy': ''
  };

  const slug = 'southport-county-court';

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
      nameFieldError: ''
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should put court general info', async () => {
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
      nameFieldError: ''
    } as CourtGeneralInfoData;
    await controller.put(req, res);

    //expect(mockApi.updateGeneralInfo).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResults);
  });

  test('Should not put court general info if name is left blank', async () => {
    const res = mockResponse();
    const req = mockRequest();
    req.session.user.isSuperAdmin = true;
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
      nameFieldError: controller.blankNameErrorMsg
    } as CourtGeneralInfoData;
    await controller.put(req, res);

    //expect(mockApi.updateGeneralInfo).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResults);
  });

  test('Should handle errors when getting court general info from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: slug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getGeneralInfo = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    const res = mockResponse();

    await controller.get(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: null,
      errorMsg: controller.getGeneralInfoErrorMsg,
      updated: false,
      nameFieldError: ''
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should handle errors when posting court general info to API', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500;
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
      nameFieldError: ''
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should not put court general info if name has invalid characters', async () => {
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = courtGeneralInfoInvalidCharacters;
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: courtGeneralInfoInvalidCharacters,
      errorMsg: controller.updateGeneralInfoErrorMsg,
      updated: false,
      nameFieldError: controller.specialCharacterErrorMsg
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should not update general info if intro paragraph more than 300 chars', async () => {
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = courtGeneralInfoTooManyCharsForIntroParagraph;
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: courtGeneralInfoTooManyCharsForIntroParagraph,
      errorMsg: controller.updateIntroParagraphErrorMsg,
      updated: false,
      nameFieldError: ''
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should handle errors when posting court general info to with a duplicate name', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 409;
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = courtGeneralInfo;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateGeneralInfo = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: courtGeneralInfo,
      errorMsg: controller.updateDuplicateGeneralInfoErrorMsg + courtGeneralInfo.name,
      updated: false,
      nameFieldError: controller.duplicateNameErrorMsg
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });

  test('Should not put court general info if alerts have over 300 characters', async () => {
    const res = mockResponse();
    const req = mockRequest();
    req.params = { slug: slug };
    req.body = courtGeneralInfoOverCharacterLimit;
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    const expectedResult: CourtGeneralInfoData = {
      generalInfo: courtGeneralInfoOverCharacterLimit,
      errorMsg: controller.updateAlertErrorMsg,
      updated: false,
      nameFieldError: ''
    };

    expect(res.render).toBeCalledWith('courts/tabs/generalContent', expectedResult);
  });
});
