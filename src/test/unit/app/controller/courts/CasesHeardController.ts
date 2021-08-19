import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';
import {CasesHeardController} from '../../../../../main/app/controller/courts/CasesHeardController';

describe('CasesHeardController', () => {

  let mockApi: {
    getAllAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtAreasOfLaw: () => Promise<AreaOfLaw[]>,
    updateCourtAreasOfLaw: () => Promise<AreaOfLaw[]>};


  const testSlug = 'plymouth-combined-court';
  const getAllAreasOfLawData = [
    {id: 1, name: 'Adoption'},
    {id: 2, name: 'Bankruptcy'},
    {id: 3, name: 'Children'},
    {id: 4, name: 'Civil Partnership'},
    {id: 5, name: 'Court of Appeal'},
    {id: 6, name: 'Crime'}
  ];
  const getCourtAreasOfLawData = [
    {id: 1, name: 'Adoption'},
    {id: 4, name: 'Civil Partnership'},
    {id: 5, name: 'Court of Appeal'}
  ];
  const updatedCourtAreasOfLawData = [
    {id: 1, name: 'Adoption'},
    {id: 2, name: 'Bankruptcy'},
    {id: 3, name: 'Children'},
    {id: 4, name: 'Civil Partnership'},
    {id: 5, name: 'Court of Appeal'}
  ];

  const getAllAreasOfLaw: () => AreaOfLaw[] = () => getAllAreasOfLawData;
  const getCourtAreasOfLaw: (testSlug: string) => AreaOfLaw[] = () => getCourtAreasOfLawData;
  const updateCourtAreasOfLaw: (testSlug: string, updatedCourtAreasOfLawData: AreaOfLaw[]) => AreaOfLaw[] = () => getAllAreasOfLawData;

  const controller = new CasesHeardController();

  beforeEach(() => {
    mockApi = {
      getAllAreasOfLaw: async (): Promise<AreaOfLaw[]> => getAllAreasOfLaw(),
      getCourtAreasOfLaw: async (): Promise<AreaOfLaw[]> => getCourtAreasOfLaw(testSlug),
      updateCourtAreasOfLaw: async (): Promise<AreaOfLaw[]> => updateCourtAreasOfLaw(testSlug, updatedCourtAreasOfLawData)
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    jest.spyOn(mockApi, 'getAllAreasOfLaw');
    jest.spyOn(mockApi, 'getCourtAreasOfLaw');
    jest.spyOn(mockApi, 'updateCourtAreasOfLaw');
  });

  test('Should get cases heard view and render the page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/casesHeardContent', {
      allAreasOfLaw: getAllAreasOfLawData,
      courtAreasOfLaw: getCourtAreasOfLawData,
      slug: testSlug,
      errorMsg: [],
      updated: false,
      renderUpdateButton: true
    });
    expect(mockApi.getAllAreasOfLaw).toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).toBeCalledWith(testSlug);
  });

  test('Should display an error if all areas of law cant be retrieved when getting cases heard', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getAllAreasOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/casesHeardContent', {
      allAreasOfLaw: null,
      courtAreasOfLaw: getCourtAreasOfLawData,
      slug: testSlug,
      errorMsg: [{text: controller.getAreasOfLawErrorMsg}],
      updated: false,
      renderUpdateButton: false
    });
    expect(mockApi.getAllAreasOfLaw).toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).toBeCalledWith(testSlug);
  });

  test('Should display an error if court areas of law cant be retrieved when getting cases heard', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtAreasOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/casesHeardContent', {
      allAreasOfLaw: getAllAreasOfLawData,
      courtAreasOfLaw: null,
      slug: testSlug,
      errorMsg: [{text: controller.getCourtAreasOfLawErrorMsg}],
      updated: false,
      renderUpdateButton: false
    });
    expect(mockApi.getAllAreasOfLaw).toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).toBeCalledWith(testSlug);
  });

  test('Should update cases heard', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'courtAreasOfLaw': updatedCourtAreasOfLawData,
      'allAreasOfLaw': getAllAreasOfLawData,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/casesHeardContent', {
      allAreasOfLaw: getAllAreasOfLawData,
      courtAreasOfLaw: updatedCourtAreasOfLawData,
      slug: testSlug,
      errorMsg: [],
      updated: true,
      renderUpdateButton: true
    });
    expect(mockApi.updateCourtAreasOfLaw).toBeCalledWith(testSlug, updatedCourtAreasOfLawData);
  });

  test('Should not update cases heard if the api returns with an error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'courtAreasOfLaw': updatedCourtAreasOfLawData,
      'allAreasOfLaw': getAllAreasOfLawData,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    const errorResponse = mockResponse();

    req.scope.cradle.api.updateCourtAreasOfLaw = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/casesHeardContent', {
      allAreasOfLaw: getAllAreasOfLawData,
      courtAreasOfLaw: updatedCourtAreasOfLawData,
      slug: testSlug,
      errorMsg: [{text: controller.putCourtAreasOfLawErrorMsg}],
      updated: false,
      renderUpdateButton: true
    });
    expect(mockApi.updateCourtAreasOfLaw).toBeCalledWith(testSlug, updatedCourtAreasOfLawData);
  });

  test('Should not update cases heard if CSRF token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'courtAreasOfLaw': updatedCourtAreasOfLawData,
      'allAreasOfLaw': getAllAreasOfLawData,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/casesHeardContent', {
      allAreasOfLaw: getAllAreasOfLawData,
      courtAreasOfLaw: updatedCourtAreasOfLawData,
      slug: testSlug,
      errorMsg: [{text: controller.putCourtAreasOfLawErrorMsg}],
      updated: false,
      renderUpdateButton: true
    });
    expect(mockApi.updateCourtAreasOfLaw).not.toBeCalled();
  });
});
