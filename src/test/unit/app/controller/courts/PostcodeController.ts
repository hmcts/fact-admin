import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {Postcode, PostcodeData} from '../../../../../main/types/Postcode';
import {PostcodesController} from '../../../../../main/app/controller/courts/PostcodesController';

describe('PostcodeController', () => {

  let mockApi: {
    getPostcodes: () => Promise<Postcode[]>,
    addPostcodes: () => Promise<Postcode[]> };

  const postcodeData: Postcode[] = ['PL1'].map(value => { return {'postcode': value}; });
  const getPostcodes: () => Postcode[] = () => postcodeData;
  const addPostcodes: () => Postcode[] = () => postcodeData;


  const controller = new PostcodesController();

  beforeEach(() => {
    mockApi = {
      getPostcodes: async (): Promise<Postcode[]> => getPostcodes(),
      addPostcodes: async (): Promise<Postcode[]> => addPostcodes()
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

    await controller.post(req, res);

    const expectedResults: PostcodeData = {
      postcodes: postcodeData,
      slug: slug,
      searchValue: '',
      updated: true,
      errors: []
      // errors: ['One or more postcodes provided already exist: PL3'].map(value => { return {'text': value}; })
    };
    // Should not call API if emails data is incomplete
    expect(res.render).toBeCalledWith('courts/tabs/postcodesContent', expectedResults);
    expect(mockApi.addPostcodes).not.toBeCalled();
  });
  //
  // test('Should not post emails if CSRF token is invalid', async () => {
  //   const req = mockRequest();
  //   const res = mockResponse();
  //   req.params = {
  //     slug: 'plymouth-combined-court'
  //   };
  //   req.body = {
  //     'emails': emailsInvalidSyntax,
  //     '_csrf': CSRF.create()
  //   };
  //   req.scope.cradle.api = mockApi;
  //   req.scope.cradle.api.updateEmails = jest.fn().mockReturnValue(res);
  //   (CSRF.verify as jest.Mock).mockReturnValue(false);
  //
  //   await controller.put(req, res);
  //
  //   const expectedResults: EmailData = {
  //     emails: emailsInvalidSyntax,
  //     emailTypes: expectedSelectItems,
  //     updated: false,
  //     errors: [{text: controller.updateErrorMsg}]
  //   };
  //   expect(mockApi.updateEmails).not.toBeCalled();
  //   expect(res.render).toBeCalledWith('courts/tabs/emailsContent', expectedResults);
  // });
  //
  // test('Should handle address blank error when getting email data from API', async () => {
  //   const req = mockRequest();
  //   req.params = {
  //     slug: 'plymouth-combined-court'
  //   };
  //   req.scope.cradle.api = mockApi;
  //   req.scope.cradle.api.getEmails = jest.fn().mockRejectedValue(new Error('Mock API Error'));
  //   const res = mockResponse();
  //
  //   await controller.get(req, res);
  //
  //   const expectedResults: EmailData = {
  //     emails: null,
  //     emailTypes: expectedSelectItems,
  //     updated: false,
  //     errors: [{text: controller.getEmailsErrorMsg}]
  //   };
  //   expect(res.render).toBeCalledWith('courts/tabs/emailsContent', expectedResults);
  // });
});
