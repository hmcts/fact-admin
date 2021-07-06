import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {PostcodeData} from '../../../../../main/types/Postcode';
import {PostcodesController} from '../../../../../main/app/controller/courts/PostcodesController';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';
import {CourtType} from '../../../../../main/types/CourtType';
import {familyAreaOfLaw} from '../../../../../main/enums/familyAreaOfLaw';

describe('PostcodeController', () => {

  let mockApi: {
    getPostcodes: () => Promise<string[]>,
    addPostcodes: () => Promise<string[]>,
    getCourts: () => Promise<object[]>,
    deletePostcodes: () => Promise<object>,
    movePostcodes: () => Promise<object[]>,
    getCourtAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtCourtTypes: () => Promise<CourtType[]>};

  const getPostcodeData = ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'];
  const getPostcodeInput = 'PL1,PL2,PL3,PL11 1YY,PL1 1,PL 1';
  const getDeletedPostcodes = ['PL1', 'PL2', 'PL3'];
  const getMovedPostcodes = ['PL11 1YY', 'PL1 1'];
  const newPostcodes = 'PL4,PL5,PL6';
  const getPostcodes: () => string[] = () => getPostcodeData;
  const happyCourtTypes: CourtType[] = [
    { id: 11420, name: 'Crown Court', code: 446 },
    { id: 11419, name: 'County Court', code: 296 },
    { id: 11417, name: 'Family Court', code: null }
  ];
  const happyCourtAreasOfLaw: AreaOfLaw[] = [
    { id: 1, name:familyAreaOfLaw.housing},
    { id: 2, name:familyAreaOfLaw.moneyClaims},
    { id: 3, name:familyAreaOfLaw.bankruptcy}
  ];

  const controller = new PostcodesController();

  beforeEach(() => {
    mockApi = {
      getPostcodes: async (): Promise<string[]> => getPostcodes(),
      addPostcodes: async (): Promise<string[]> => newPostcodes.split(','),
      getCourts: async (): Promise<object[]> => [],
      deletePostcodes: async (): Promise<object[]> => [],
      movePostcodes: async (): Promise<object[]> => [],
      getCourtAreasOfLaw: async (): Promise<AreaOfLaw[]> => happyCourtAreasOfLaw,
      getCourtCourtTypes: async (): Promise<CourtType[]> => happyCourtTypes
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get postcodes view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'plymouth-combined-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: 'plymouth-combined-court',
      searchValue: '',
      updated: false,
      errors: [],
      isEnabled: true,
      areasOfLaw: happyCourtAreasOfLaw,
      courtTypes: happyCourtTypes
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
  });

  test('Should not add postcodes if any are duplicated', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': 'PL3,PL4,PL5',
      'csrfToken': CSRF.create(),
      'courtTypes': happyCourtTypes,
      'areasOfLaw': happyCourtAreasOfLaw
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: slug,
      searchValue: 'PL3,PL4,PL5',
      updated: true,
      errors: [{text: controller.duplicatePostcodeMsg + 'PL3'}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });

  test('Should not add postcodes if they are not the right length constraint', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': 'P,M,KUPOMOSH123',
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: slug,
      searchValue: 'P,M,KUPOMOSH123',
      updated: false,
      errors: [{text: controller.postcodesNotValidMsg + 'P,M,KUPOMOSH123'}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });

  test('Should add postcodes if all are verified', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1','PL2','PL3','PL11 1YY','PL1 1','PL 1','PL4','PL5','PL6'],
      courts: [],
      slug: slug,
      searchValue: '',
      updated: true,
      errors: [],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).toBeCalledWith(slug, newPostcodes.split(','));
  });

  test('Should not add postcodes if the api returns with an error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['pl1'];
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.addPostcodes = jest.fn().mockRejectedValue(errorResponse);
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: slug,
      searchValue: 'PL4,PL5,PL6',
      updated: false,
      errors: [{'text': 'A problem has occurred (your changes have not been saved). The following postcodes are invalid: pl1'}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).toBeCalledWith(slug, newPostcodes.split(','));
  });

  test('Should not post postcodes if CSRF token is invalid', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.addErrorMsg}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });

  test('Should handle new postcode blank error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': '',
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: slug,
      searchValue: '',
      updated: true,
      errors: [{text: controller.noPostcodeErrorMsg}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });

  test('Should not delete postcodes if CSRF token is invalid', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'deletePostcodes');

    await controller.delete(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.addErrorMsg}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.deletePostcodes).not.toBeCalled();
  });

  test('Should handle delete postcode no selection error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': '',
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'deletePostcodes');

    await controller.delete(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.noSelectedPostcodeMsg}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.deletePostcodes).not.toBeCalled();
  });

  test('Should delete postcodes if all are verified', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getDeletedPostcodes,
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'deletePostcodes');

    await controller.delete(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: slug,
      searchValue: '',
      updated: true,
      errors: [],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.deletePostcodes).toBeCalledWith(slug, getDeletedPostcodes);
  });

  test('Should not delete postcodes if the api returns with an error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getDeletedPostcodes,
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL1','PL2','PL3'];
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.deletePostcodes = jest.fn().mockRejectedValue(errorResponse);
    jest.spyOn(mockApi, 'deletePostcodes');

    await controller.delete(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{'text': 'A problem has occurred when attempting to delete the following postcodes: PL1,PL2,PL3'}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.deletePostcodes).toBeCalledWith(slug, ['PL1','PL2','PL3']);
  });

  // TODO: CSRF TOKEN INVALID TEST FOR MOVING POSTCODES
  test('Should not move postcodes if CSRF token is invalid', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL11 1YY', 'PL1 1'];
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.movePostcodes = jest.fn().mockRejectedValue(errorResponse);
    jest.spyOn(mockApi, 'movePostcodes');

    await controller.put(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{'text': controller.moveErrorMsg}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.movePostcodes).not.toBeCalled();
  });

  // TODO: HAPPY PATH SCENARIO TEST FOR MOVING POSTCODES
  test('Should move postcodes if there are no errors', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'movePostcodes');

    await controller.put(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL 1'],
      courts: [],
      slug: slug,
      searchValue: '',
      updated: true,
      errors: [],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.movePostcodes).toBeCalledWith(slug, 'Mosh Land Court', ['PL11 1YY','PL1 1']);
  });

  test('Should handle move postcode no selection error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getDeletedPostcodes,
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'movePostcodes');

    await controller.put(req, res);

    const expectedResults: PostcodeData = {
      postcodes: getPostcodeData,
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.noSelectedPostcodeOrCourtMsg}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.movePostcodes).not.toBeCalled();
  });

  test('Should not move postcodes if the api returns with an error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL11 1YY', 'PL1 1'];
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.movePostcodes = jest.fn().mockRejectedValue(errorResponse);
    jest.spyOn(mockApi, 'movePostcodes');

    await controller.put(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{'text': 'A problem has occurred when attempting to move the following postcodes: PL11 1YY,PL1 1'}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.movePostcodes).toBeCalledWith(slug, 'Mosh Land Court', ['PL11 1YY','PL1 1']);
  });

  test('Should not move postcodes if the api returns with a conflict error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'areasOfLaw': happyCourtAreasOfLaw,
      'courtTypes': happyCourtTypes
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL11 1YY', 'PL1 1'];
    errorResponse.response.status = 409;
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.movePostcodes = jest.fn().mockRejectedValue(errorResponse);
    jest.spyOn(mockApi, 'movePostcodes');

    await controller.put(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{'text': 'The postcode is already present on the destination court: PL11 1YY,PL1 1'}],
      isEnabled: true,
      courtTypes: happyCourtTypes,
      areasOfLaw: happyCourtAreasOfLaw
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.movePostcodes).toBeCalledWith(slug, 'Mosh Land Court', ['PL11 1YY','PL1 1']);
  });
});
