import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {SpoeAreaOfLaw} from '../../../../../main/types/SpoeAreaOfLaw';
import {CourtSpoeController} from '../../../../../main/app/controller/courts/CourtSpoeController';

describe('CourtsSpoeController', () => {

  let mockApi: {
    getAllSpoeAreasOfLaw: () => Promise<SpoeAreaOfLaw[]>;
    getCourtSpoeAreasOfLaw: () => Promise<SpoeAreaOfLaw[]>;
    updateCourtSpoeAreasOfLaw: () => Promise<SpoeAreaOfLaw[]>;};

  const testSlug = 'plymouth-combined-court';

  const getSpoeAreaOfLaw: (id: number, name: string, singlePointEntry: boolean ) => SpoeAreaOfLaw =
    (id: number, name: string ) => { return { id: id, name: name, 'singlePointEntry': true }; };

  const getAllSpoeAreasOfLawData: SpoeAreaOfLaw[] = [
    getSpoeAreaOfLaw(1, 'Adoption', true),
    getSpoeAreaOfLaw(2, 'Children', true),
    getSpoeAreaOfLaw(3, 'Civil Partnership', true),
    getSpoeAreaOfLaw(4, 'Divorce', true),
  ];
  const getCourtSpoeAreasOfLawData: SpoeAreaOfLaw[] = [
    getSpoeAreaOfLaw(1, 'Adoption', true),
    getSpoeAreaOfLaw(2, 'Civil Partnership', true),
  ];
  const updatedCourtSpoeAreasOfLawData: SpoeAreaOfLaw[] = [
    getSpoeAreaOfLaw(1, 'Adoption', true),
    getSpoeAreaOfLaw(2, 'Civil Partnership', true),
    getSpoeAreaOfLaw(3, 'Children', true)
  ];

  const getAllSpoeAreasOfLaw: () => SpoeAreaOfLaw[] = () => getAllSpoeAreasOfLawData;
  const getCourtSpoeAreasOfLaw: (testSlug: string) => SpoeAreaOfLaw[] = () => getCourtSpoeAreasOfLawData;
  const updateCourtSpoeAreasOfLaw: (testSlug: string, updatedCourtSpoeAreasOfLawData: SpoeAreaOfLaw[]) => SpoeAreaOfLaw[] = () => getAllSpoeAreasOfLawData;

  const controller = new CourtSpoeController();

  beforeEach(() => {
    mockApi = {
      getAllSpoeAreasOfLaw: async (): Promise<SpoeAreaOfLaw[]> => getAllSpoeAreasOfLaw(),
      getCourtSpoeAreasOfLaw: async (): Promise<SpoeAreaOfLaw[]> => getCourtSpoeAreasOfLaw(testSlug),
      updateCourtSpoeAreasOfLaw: async (): Promise<SpoeAreaOfLaw[]> => updateCourtSpoeAreasOfLaw(testSlug, updatedCourtSpoeAreasOfLawData)
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    jest.spyOn(mockApi, 'getAllSpoeAreasOfLaw');
    jest.spyOn(mockApi, 'getCourtSpoeAreasOfLaw');
    jest.spyOn(mockApi, 'updateCourtSpoeAreasOfLaw');
  });

  test('Should get spoe view and render the page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/spoeContent', {
      allSpoeAreasOfLaw: getAllSpoeAreasOfLawData,
      courtSpoeAreasOfLaw: getCourtSpoeAreasOfLawData,
      slug: testSlug,
      errorMsg: [],
      updated: false,
      fatalError: false
    });
    expect(mockApi.getAllSpoeAreasOfLaw).toBeCalled();
    expect(mockApi.getCourtSpoeAreasOfLaw).toBeCalledWith(testSlug);
  });

  test('Should display an error if all spoe areas of law cant be retrieved', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getAllSpoeAreasOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/spoeContent', {
      allSpoeAreasOfLaw: null,
      courtSpoeAreasOfLaw: getCourtSpoeAreasOfLawData,
      slug: testSlug,
      errorMsg: [{text: controller.getSpoeAreasOfLawErrorMsg}],
      updated: false,
      fatalError: true
    });
    expect(mockApi.getAllSpoeAreasOfLaw).toBeCalled();
    expect(mockApi.getCourtSpoeAreasOfLaw).toBeCalledWith(testSlug);
  });

  test('Should display an error if court spoe areas of law cant be retrieved', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtSpoeAreasOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/spoeContent', {
      allSpoeAreasOfLaw: getAllSpoeAreasOfLawData,
      courtSpoeAreasOfLaw: null,
      slug: testSlug,
      errorMsg: [{text: controller.getCourtSpoeAreasOfLawErrorMsg}],
      updated: false,
      fatalError: true
    });
    expect(mockApi.getAllSpoeAreasOfLaw).toBeCalled();
    expect(mockApi.getCourtSpoeAreasOfLaw).toBeCalledWith(testSlug);
  });

  test('Should update spoe areas of law for court', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'courtSpoeAreasOfLaw': updatedCourtSpoeAreasOfLawData,
      'allSpoeAreasOfLaw': getAllSpoeAreasOfLawData,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;


    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/spoeContent', {
      allSpoeAreasOfLaw: getAllSpoeAreasOfLawData,
      courtSpoeAreasOfLaw: updatedCourtSpoeAreasOfLawData,
      slug: testSlug,
      errorMsg: [],
      updated: true,
      fatalError: false
    });
    expect(mockApi.updateCourtSpoeAreasOfLaw).toBeCalledWith(testSlug, updatedCourtSpoeAreasOfLawData );
  });

  test('Should not update court spoe if the api returns with an error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'courtSpoeAreasOfLaw': updatedCourtSpoeAreasOfLawData,
      'allSpoeAreasOfLaw': getAllSpoeAreasOfLawData,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    const errorResponse = mockResponse();

    req.scope.cradle.api.updateCourtSpoeAreasOfLaw = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/spoeContent', {
      allSpoeAreasOfLaw: getAllSpoeAreasOfLawData,
      courtSpoeAreasOfLaw: updatedCourtSpoeAreasOfLawData,
      slug: testSlug,
      errorMsg: [{text: controller.putCourtSpoeAreasOfLawErrorMsg}],
      updated: false,
      fatalError: false
    });
    expect(mockApi.updateCourtSpoeAreasOfLaw).toBeCalledWith(testSlug, updatedCourtSpoeAreasOfLawData);
  });

  test('Should not update court spoe if the api returns with a conflict error', async() => {
    const req = mockRequest();
    req.body = {
      'courtSpoeAreasOfLaw': updatedCourtSpoeAreasOfLawData,
      'allSpoeAreasOfLaw': getAllSpoeAreasOfLawData,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();
    res.response.status = 409;
    res.response.data = {'message': 'test'}
    req.scope.cradle.api.updateCourtSpoeAreasOfLaw = jest.fn().mockRejectedValue(res);

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/spoeContent', {
      allSpoeAreasOfLaw: getAllSpoeAreasOfLawData,
      courtSpoeAreasOfLaw: updatedCourtSpoeAreasOfLawData,
      slug: testSlug,
      errorMsg: [{text: controller.courtLockedExceptionMsg + 'test'}],
      updated: false,
      fatalError: false
    });
    expect(mockApi.updateCourtSpoeAreasOfLaw).toBeCalledWith(testSlug, updatedCourtSpoeAreasOfLawData);
  });

  test('Should not update court spoeif CSRF token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'courtSpoeAreasOfLaw': updatedCourtSpoeAreasOfLawData,
      'allSpoeAreasOfLaw': getAllSpoeAreasOfLawData,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/spoeContent', {
      allSpoeAreasOfLaw: getAllSpoeAreasOfLawData,
      courtSpoeAreasOfLaw: updatedCourtSpoeAreasOfLawData,
      slug: testSlug,
      errorMsg: [{text: controller.putCourtSpoeAreasOfLawErrorMsg}],
      updated: false,
      fatalError: false
    });
    expect(mockApi.updateCourtSpoeAreasOfLaw).not.toBeCalled();
  });
});
