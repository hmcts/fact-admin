import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { InviteUserController } from '../../../../../main/app/controller/account/InviteUserController';
import {AddUserPageData, PasswordPageData} from "../../../../../main/types/AccountPageData";
import {CSRF} from "../../../../../main/modules/csrf";
import {Account} from "../../../../../main/types/Account";

describe('InviteUserController', () => {

  let mockApi: {
    registerUser: (account: Account,access_token : string) => Promise<Account>,

  };
  const controller = new InviteUserController();

  let account: Account = null;
  const res = mockResponse();
  const req = mockRequest();
  CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
  CSRF.verify = jest.fn().mockReturnValue(true);

  beforeEach(() => {
    account = { email: 'name@test.com', lastName: 'lastName', firstName: 'firstName', roles: ['fact-admin']};

    mockApi = {
      registerUser: (account: Account, access_token : string) => Promise.resolve(account)

    };

    req.scope.cradle.idamApi = mockApi;

    req.scope.cradle.idamApi.registerUser = jest.fn().mockResolvedValue(res);

  });

  test('Should render the invite user page', async () => {

    await controller.renderUserInvite(req, res);

    const pageData: AddUserPageData = {
      errors: Array.of(),
      updated: false,
      account : null
    };

    expect(res.render).toBeCalledWith('account/tabs/inviteUserContent', pageData);
  });



  test('Should display required error message when no account details entered', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'account': { email: '', lastName: '', firstName: '', roles: []}
    };
    await controller.postUserInvite(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.emptyErrorMsg }],
      updated: false,
      account : ({ email: '', lastName: '', firstName: '', roles: []})
    };

    expect(res.render).toBeCalledWith('account/tabs/inviteUserContent',pageData);
  });

  test('Should display invalid email format message with invalid email', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'account': { email: 'test@', lastName: 'lastName', firstName: 'firstName', roles: ['fact-admin']}
    };
    await controller.postUserInvite(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.getEmailAddressFormatErrorMsg }],
      updated: false,
      account : ({ email: 'test@', lastName: 'lastName', firstName: 'firstName', roles: ['fact-admin'], isInvalidFormat: true})
    };

    expect(res.render).toBeCalledWith('account/tabs/inviteUserContent',pageData);
  });

  test('Should POST account details and render password view', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'account': account
    };
    await controller.postUserInvite(req, res);

    const pageData: PasswordPageData = {
      errors: Array.of(),
      account : JSON.stringify(account)
    };

    expect(res.render).toBeCalledWith('account/tabs/password',pageData);
  });

  test('Should render the invite successful user page', async () => {

    await controller.renderInviteSuccessful(req, res);


    expect(res.render).toBeCalledWith('account/tabs/inviteSuccessful');
  });

  test('Should POST account details and render invite successful view when valid password is entered', async () => {
    req.body = {
      '_csrf': CSRF.create(),
      'account': JSON.stringify(account),
      'error': false,
    };
    req.session.user.access_token = 'access_token';
    await controller.postPassword(req, res);

    expect(mockApi.registerUser).toBeCalled();
    expect(res.render).toBeCalledWith('account/tabs/inviteSuccessful');

  });

  test('should not post account to API calls when password is invalid ', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'account': JSON.stringify(account),
        'error': 'true'
    };

    req.session.user.access_token = 'access_token';
    await controller.postPassword(req, res);

    const pageData: PasswordPageData = {
      errors: [{ text: controller.invalidPasswordMsg }],
      account: JSON.stringify(account)
    };
    expect(res.render).toBeCalledWith('account/tabs/password', pageData);

  });

  test('should not post account to  API calls when invalid csrf token ', async () => {

    req.body = {
      '_csrf': '',
      'account': JSON.stringify(account)
    };
    CSRF.verify = jest.fn().mockReturnValue(false);
    req.session.user.access_token = 'access_token';
    await controller.postPassword(req, res);

    const pageData: PasswordPageData = {
      errors: [{ text: controller.updateErrorMsg }],
      account: JSON.stringify(account)
    };
    expect(res.render).toBeCalledWith('account/tabs/password', pageData);

  });

  test('should handle failed API calls when posting account ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500; // An internal server error
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'account': JSON.stringify(account),
      'error': false,
    };
    req.session.user.access_token = 'access_token';
    CSRF.verify = jest.fn().mockReturnValue(true);
    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.updateErrorMsg }],
      updated: false,
      account : account
    };
    expect(res.render).toBeCalledWith('account/tabs/inviteUserContent', pageData);

  });


  test('should display duplicated message when account already exists ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 409;
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'account': JSON.stringify(account),
      'error': false,
    };
    req.session.user.access_token = 'access_token';
    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.duplicatedErrorMsg }],
      updated: false,
      account : account
    };
    expect(res.render).toBeCalledWith('account/tabs/inviteUserContent', pageData);

  });


  test('should display message when admin tries invite a super admin ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 403;
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'account': JSON.stringify(account),
      'error': false,
    };
    req.session.user.access_token = 'access_token';
    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.forbiddenErrorMsg }],
      updated: false,
      account : account
    };
    expect(res.render).toBeCalledWith('account/tabs/inviteUserContent', pageData);

  });

  test('should display message when account information missing ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'account': JSON.stringify(account),
      'error': false,
    };
    req.session.user.access_token = 'access_token';
    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.forbiddenErrorMsg }],
      updated: false,
      account : account
    };
    expect(res.render).toBeCalledWith('account/tabs/inviteUserContent', pageData);

  });
});
