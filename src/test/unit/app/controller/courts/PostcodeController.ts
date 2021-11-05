import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {PostcodesController} from '../../../../../main/app/controller/courts/PostcodesController';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';
import {familyAreaOfLaw} from '../../../../../main/enums/familyAreaOfLaw';
import {CourtTypesAndCodes} from '../../../../../main/types/CourtTypesAndCodes';

describe('PostcodeController', () => {

  let mockApi: {
    getPostcodes: () => Promise<string[]>,
    addPostcodes: () => Promise<string[]>,
    getCourts: () => Promise<object[]>,
    deletePostcodes: () => Promise<object>,
    movePostcodes: () => Promise<object[]>,
    getCourtAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtTypesAndCodes: () => Promise<CourtTypesAndCodes>};

  const testSlug = 'plymouth-combined-court';
  const getPostcodeData = ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'];
  const getPostcodeInput = 'PL1,PL2,PL3,PL11 1YY,PL1 1,PL 1';
  const getDeletedPostcodes = ['PL1', 'PL2', 'PL3'];
  const getMovedPostcodes = ['PL11 1YY', 'PL1 1'];
  const newPostcodes = 'PL4,PL5,PL6';
  const getPostcodes: () => string[] = () => getPostcodeData;
  const apiCourtTypesInput: CourtTypesAndCodes = {
    'types': [
      { id: 11420, name: 'Crown Court', code: 446 },
      { id: 11419, name: 'County Court', code: 296 },
      { id: 11417, name: 'Family Court', code: null }
    ],
    'gbsCode': '123',
    'dxCodes': []
  };
  const apiCourtTypesInputInvalid: CourtTypesAndCodes = {
    'types': [
      { id: 11417, name: 'Family Court', code: null }
    ],
    'gbsCode': '123',
    'dxCodes': []
  };
  const apiAreasOfLawInput: AreaOfLaw[] = [
    {
      id: 1,
      name: familyAreaOfLaw.bankruptcy,
      'external_link': 'https://www.gov.uk/apply-for-bankruptcy',
      'external_link_desc': 'Bankruptcy',
      'external_link_desc_cy': 'Bankruptcy',
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null,
      'alt_name': null,
      'alt_name_cy': null
    },
    {
      id: 2,
      name:familyAreaOfLaw.moneyClaims,
      'external_link': 'https://www.gov.uk/make-court-claim-for-money',
      'external_link_desc': 'Money Claims',
      'external_link_desc_cy': 'Money Claims',
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null,
      'alt_name': null,
      'alt_name_cy': null
    },
    {
      id: 3,
      name:familyAreaOfLaw.housing,
      'external_link': 'https://www.gov.uk/evicting-tenants',
      'external_link_desc': 'Housing',
      'external_link_desc_cy': 'Housing',
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null,
      'alt_name': null,
      'alt_name_cy': null
    }
  ];
  const courtTypesBodyInput = 'Crown_Court,County_Court,Family_Court';
  const areasOfLawBodyInput = familyAreaOfLaw.bankruptcy + ',' + familyAreaOfLaw.moneyClaims + ',' + familyAreaOfLaw.housing;
  const courtTypesMethodOutput = ['Crown_Court', 'County_Court', 'Family_Court'];
  const courtTypesMethodOutputInvalid = ['Family_Court'];
  const areasOfLawMethodOutput = [familyAreaOfLaw.bankruptcy,
    familyAreaOfLaw.moneyClaims.replace(' ', '_'), familyAreaOfLaw.housing];

  const controller = new PostcodesController();

  beforeEach(() => {
    mockApi = {
      getPostcodes: async (): Promise<string[]> => getPostcodes(),
      addPostcodes: async (): Promise<string[]> => newPostcodes.split(','),
      getCourts: async (): Promise<object[]> => [],
      deletePostcodes: async (): Promise<object[]> => [],
      movePostcodes: async (): Promise<object[]> => [],
      getCourtAreasOfLaw: async (): Promise<AreaOfLaw[]> => apiAreasOfLawInput,
      getCourtTypesAndCodes: async (): Promise<CourtTypesAndCodes> => apiCourtTypesInput
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    jest.spyOn(mockApi, 'addPostcodes');
    jest.spyOn(mockApi, 'deletePostcodes');
    jest.spyOn(mockApi, 'movePostcodes');
    jest.spyOn(mockApi, 'getCourtAreasOfLaw');
    jest.spyOn(mockApi, 'getCourtTypesAndCodes');
  });

  test('Should get postcodes view and render the page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: 'plymouth-combined-court',
      searchValue: '',
      updated: false,
      errors: [],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.getCourtAreasOfLaw).toBeCalledWith(testSlug);
    expect(mockApi.getCourtTypesAndCodes).toBeCalledWith(testSlug);
  });

  test('Should display an error if courts cant be retrieved when getting postcodes', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourts = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: 'plymouth-combined-court',
      searchValue: '',
      updated: false,
      errors: [{text: controller.getCourtsErrorMsg}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.getCourtAreasOfLaw).toBeCalledWith(testSlug);
    expect(mockApi.getCourtTypesAndCodes).toBeCalledWith(testSlug);
  });

  test('Should get postcodes view and render the page with invalid court court type', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = {
      getPostcodes: async (): Promise<string[]> => getPostcodes(),
      addPostcodes: async (): Promise<string[]> => newPostcodes.split(','),
      getCourts: async (): Promise<object[]> => [],
      deletePostcodes: async (): Promise<object[]> => [],
      movePostcodes: async (): Promise<object[]> => [],
      getCourtAreasOfLaw: async (): Promise<AreaOfLaw[]> => apiAreasOfLawInput,
      getCourtTypesAndCodes: async (): Promise<CourtTypesAndCodes> => apiCourtTypesInputInvalid
    };

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: 'plymouth-combined-court',
      searchValue: '',
      updated: false,
      errors: [],
      isEnabled: false, // check this is false
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutputInvalid
    });
  });

  test('Should not add postcodes if any are duplicated', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': 'PL3,PL4,PL5',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.post(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: testSlug,
      searchValue: 'PL3,PL4,PL5',
      updated: true,
      errors: [{text: controller.duplicatePostcodeMsg + 'PL3'}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.addPostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not add postcodes if they are not the right length constraint', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': 'P,M,KUPOMOSH123',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.post(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: testSlug,
      searchValue: 'P,M,KUPOMOSH123',
      updated: true,
      errors: [{text: controller.postcodesNotValidMsg + 'P,M,KUPOMOSH123'}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.addPostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should add postcodes if all are verified', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.post(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL1','PL2','PL3','PL11 1YY','PL1 1','PL 1','PL4','PL5','PL6'],
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: true,
      errors: [],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.addPostcodes).toBeCalledWith(testSlug, newPostcodes.split(','));
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not add postcodes if the api returns with an error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['pl1'];
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.addPostcodes = jest.fn().mockRejectedValue(errorResponse);

    await controller.post(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: testSlug,
      searchValue: 'PL4,PL5,PL6',
      updated: true,
      errors: [{'text': 'A problem has occurred (your changes have not been saved). The following postcodes are invalid: pl1'}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.addPostcodes).toBeCalledWith(testSlug, newPostcodes.split(','));
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not post postcodes if CSRF token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.post(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.addErrorMsg}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.addPostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should handle new postcode blank error', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'newPostcodes': '',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.post(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: true,
      errors: [{text: controller.noPostcodeErrorMsg}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.addPostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not delete postcodes if CSRF token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': newPostcodes,
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.addErrorMsg}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.deletePostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should handle delete postcode no selection error', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': '',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.noSelectedPostcodeMsg}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.deletePostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should delete postcodes if all are verified', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getDeletedPostcodes,
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: true,
      errors: [],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.deletePostcodes).toBeCalledWith(testSlug, getDeletedPostcodes);
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not delete postcodes if the api returns with an error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getDeletedPostcodes,
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL1','PL2','PL3'];
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.deletePostcodes = jest.fn().mockRejectedValue(errorResponse);

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{'text': 'A problem has occurred when attempting to delete the following postcodes: PL1,PL2,PL3'}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.deletePostcodes).toBeCalledWith(testSlug, ['PL1','PL2','PL3']);
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not move postcodes if CSRF token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL11 1YY', 'PL1 1'];
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.movePostcodes = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{'text': controller.moveErrorMsg}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.movePostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should move postcodes if there are no errors', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };

    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL 1'],
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: true,
      errors: [],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.movePostcodes).toBeCalledWith(testSlug, 'Mosh Land Court', ['PL11 1YY','PL1 1']);
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should handle move postcode no selection error', async() => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getDeletedPostcodes,
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: getPostcodeData,
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.noSelectedPostcodeOrCourtMsg}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.movePostcodes).not.toBeCalled();
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not move postcodes if the api returns with an error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL11 1YY', 'PL1 1'];
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.movePostcodes = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{'text': 'A problem has occurred when attempting to move the following postcodes: PL11 1YY,PL1 1'}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.movePostcodes).toBeCalledWith(testSlug, 'Mosh Land Court', ['PL11 1YY','PL1 1']);
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not move postcodes if the api returns with a conflict error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'existingPostcodes': getPostcodeInput,
      'selectedPostcodes': getMovedPostcodes,
      'selectedCourt': 'Mosh Land Court',
      'csrfToken': CSRF.create(),
      'courtTypes': courtTypesBodyInput,
      'areasOfLaw': areasOfLawBodyInput
    };
    const errorResponse = mockResponse();
    errorResponse.response.data = ['PL11 1YY', 'PL1 1'];
    errorResponse.response.status = 409;
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.movePostcodes = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'],
      courts: [],
      slug: testSlug,
      searchValue: '',
      updated: false,
      errors: [{'text': 'The postcode is already present on the destination ' +
          'court (your changes have not been saved): PL11 1YY,PL1 1'}],
      isEnabled: true,
      areasOfLaw: areasOfLawMethodOutput,
      courtTypes: courtTypesMethodOutput
    });
    expect(mockApi.movePostcodes).toBeCalledWith(testSlug, 'Mosh Land Court', ['PL11 1YY','PL1 1']);
    expect(mockApi.getCourtAreasOfLaw).not.toBeCalled();
    expect(mockApi.getCourtTypesAndCodes).not.toBeCalled();
  });
});
