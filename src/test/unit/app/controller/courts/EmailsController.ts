import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EmailType} from '../../../../../main/types/EmailType';
import {Email, EmailData} from '../../../../../main/types/Email';
import {EmailsController} from '../../../../../main/app/controller/courts/EmailsController';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CSRF} from '../../../../../main/modules/csrf';

describe('EmailsController', () => {

  let mockApi: {
    getEmails: () => Promise<Email[]>,
    updateEmails: () => Promise<Email[]>,
    getEmailTypes: () => Promise<EmailType[]> };

  const getEmails: () => Email[] = () => [
    {
      address: 'abc@test.com', explanation: 'explanation ',
      explanationCy: 'explanation cy', adminEmailTypeId: 8, isNew: false
    },
    {
      address: 'abc@test2.com', explanation: 'explanation 2',
      explanationCy: 'explanation cy 2', adminEmailTypeId: 2, isNew: false
    }
  ];

  const emailsWithEmptyEntry: Email[] =
    getEmails().concat({ adminEmailTypeId: null, address: null, explanation: null, explanationCy: null, isNew: true });

  const emailsInvalidSyntax: Email[] = [
    {
      address: 'abc1', explanation: 'explanation ',
      explanationCy: 'explanation cy', adminEmailTypeId: 8
    },
    {
      address: 'abc2', explanation: 'explanation 2',
      explanationCy: 'explanation cy 2', adminEmailTypeId: 2
    }
  ];

  const emailTypes: EmailType[] = [
    { id: 1, description: 'desc 1', descriptionCy: 'desc cy 1'},
    { id: 2, description: 'desc 2', descriptionCy: 'desc cy 2' },
    { id: 3, description: 'desc 3', descriptionCy: 'desc cy 3'},
    { id: 4, description: 'desc 4', descriptionCy: 'desc cy 4' }
  ];

  const expectedSelectItems: SelectItem[] = [
    { value: 1,
      text: 'desc 1',
      selected: false },
    { value: 2,
      text: 'desc 2',
      selected: false },
    { value: 3,
      text: 'desc 3',
      selected: false },
    { value: 4,
      text: 'desc 4',
      selected: false }
  ];

  const controller = new EmailsController();

  beforeEach(() => {
    mockApi = {
      getEmails: async (): Promise<Email[]> => getEmails(),
      updateEmails: async (): Promise<Email[]> => getEmails(),
      getEmailTypes: async (): Promise<EmailType[]> => emailTypes
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get emails view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'plymouth-combined-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: EmailData = {
      emails: emailsWithEmptyEntry,
      emailTypes: expectedSelectItems,
      updated: false,
      errorMsg: ''
    };
    expect(res.render).toBeCalledWith('courts/tabs/emailsContent', expectedResults);
  });

  test('Should post emails if the fields are valid', async () => {
    const slug = 'plymouth-combined-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'emails': getEmails(),
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateEmails = jest.fn().mockResolvedValue(getEmails());

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateEmails).toBeCalledWith(slug, getEmails());
  });

  test('Should not post emails if type or address field(s) are empty', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedEmails: Email[] = [
      { adminEmailTypeId: 1, address: null, explanation: null, explanationCy: null},
      { adminEmailTypeId: null, address: 'an address', explanation: null, explanationCy: null }
    ];

    req.body = {
      'emails': postedEmails,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateEmails = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if emails data is incomplete
    expect(mockApi.updateEmails).not.toBeCalled();
  });

  test('Should not post emails if CSRF token is invalid', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: 'plymouth-combined-court'
    };
    req.body = {
      'emails': emailsInvalidSyntax,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateEmails = jest.fn().mockReturnValue(res);
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    await controller.put(req, res);

    const expectedResults: EmailData = {
      emails: emailsInvalidSyntax,
      emailTypes: expectedSelectItems,
      updated: false,
      errorMsg: 'A problem occurred when saving the emails.'
    };
    expect(mockApi.updateEmails).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/emailsContent', expectedResults);
  });

  test('Should handle email address error invalid syntax when getting email data from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'plymouth-combined-court'
    };
    req.body = {
      'emails': emailsInvalidSyntax,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getEmails = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);

    const expectedResults: EmailData = {
      emails: emailsInvalidSyntax,
      emailTypes: expectedSelectItems,
      updated: false,
      errorMsg: controller.getEmailAddressFormatErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/emailsContent', expectedResults);
  });

  test('Should handle address blank error when getting email data from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'plymouth-combined-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getEmails = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: EmailData = {
      emails: null,
      emailTypes: expectedSelectItems,
      updated: false,
      errorMsg: controller.getEmailsErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/emailsContent', expectedResults);
  });

  test('Should handle errors when getting email types from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'plymouth-combined-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getEmailTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: EmailData = {
      emails: emailsWithEmptyEntry,
      emailTypes: [],
      updated: false,
      errorMsg: controller.getEmailTypesErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/emailsContent', expectedResults);
  });
});
