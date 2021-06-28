import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {PostcodeData} from '../../../../../main/types/Postcode';
import {PostcodesController} from '../../../../../main/app/controller/courts/PostcodesController';

describe('PostcodeController', () => {

  let mockApi: {
    getPostcodes: () => Promise<string[]>,
    addPostcodes: () => Promise<string[]> };

  const postcodeData = ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1'];
  const newPostcodes = 'PL4,PL5,PL6';
  const getPostcodes: () => string[] = () => postcodeData;
  const addPostcodes: () => string[] = () => postcodeData;


  const controller = new PostcodesController();

  beforeEach(() => {
    mockApi = {
      getPostcodes: async (): Promise<string[]> => getPostcodes(),
      addPostcodes: async (): Promise<string[]> => addPostcodes()
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
      postcodes: postcodeData,
      slug: 'plymouth-combined-court',
      searchValue: '',
      updated: false,
      errors: []
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
  });

  test('Should not add postcodes if any are duplicated', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': postcodeData,
      'newPostcodes': 'PL3,PL4,PL5',
      'csrfToken': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: postcodeData,
      slug: slug,
      searchValue: 'PL3,PL4,PL5',
      updated: true,
      errors: [{text: controller.duplicatePostcodeMsg + 'PL3'}]
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });

  test('Should add postcodes if all are verified', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    mockApi = {
      getPostcodes: async (): Promise<string[]> => getPostcodes(),
      addPostcodes: async (): Promise<string[]> => newPostcodes.split(',')
    };
    req.body = {
      'existingPostcodes': postcodeData,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: ['PL1', 'PL2', 'PL3', 'PL11 1YY', 'PL1 1', 'PL 1', 'PL4', 'PL5', 'PL6'],
      slug: slug,
      searchValue: '',
      updated: true,
      errors: []
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
      'existingPostcodes': postcodeData,
      'newPostcodes': newPostcodes,
      'csrfToken': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: postcodeData,
      slug: slug,
      searchValue: '',
      updated: false,
      errors: [{text: controller.addErrorMsg}]
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });

  test('Should handle new postcode blank error', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'existingPostcodes': postcodeData,
      'newPostcodes': '',
      'csrfToken': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    jest.spyOn(mockApi, 'addPostcodes');

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: postcodeData,
      slug: slug,
      searchValue: '',
      updated: true,
      errors: [{text: controller.noPostcodeErrorMsg}]
    };
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });
});
