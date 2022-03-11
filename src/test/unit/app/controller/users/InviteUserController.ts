import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { InviteUserController } from '../../../../../main/app/controller/users/InviteUserController';
import {AddUserPageData, PasswordPageData} from '../../../../../main/types/UserPageData';
import {CSRF} from '../../../../../main/modules/csrf';
import {User} from '../../../../../main/types/User';

describe('InviteUserController', () => {

  let mockApi: {
    registerUser: (account: User, accessToken: string) => Promise<User>

  };
  const controller = new InviteUserController();

  let user: User = null;
  const res = mockResponse();
  const req = mockRequest();
  CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
  CSRF.verify = jest.fn().mockReturnValue(true);

  beforeEach(() => {
    user = { email: 'name@test.com', surname: 'surname', forename: 'forename', roles: ['fact-admin']};

    mockApi = {
      registerUser: (user: User, accessToken: string) => Promise.resolve(user)

    };

    req.scope.cradle.idamApi = mockApi;

    req.scope.cradle.idamApi.registerUser = jest.fn().mockResolvedValue(res);
    req.session.user.accessToken = 'accessToken';

  });

  test('Should render the invite user page', async () => {

    await controller.renderUserInvite(req, res);

    const pageData: AddUserPageData = {
      errors: Array.of(),
      updated: false,
      user : null
    };

    expect(res.render).toBeCalledWith('users/tabs/inviteUserContent', pageData);
  });



  test('Should display required error message when no account details entered', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'user': { email: '', surname: '', forename: '', roles: []}
    };
    await controller.postUserInvite(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.emptyErrorMsg }],
      updated: false,
      user : ({ email: '', surname: '', forename: '', roles: []})
    };

    expect(res.render).toBeCalledWith('users/tabs/inviteUserContent',pageData);
  });

  test('Should display invalid email format message with invalid email', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'user': { email: 'test@', surname: 'surname', forename: 'forename', roles: ['fact-admin']}
    };
    await controller.postUserInvite(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.getEmailAddressFormatErrorMsg }],
      updated: false,
      user : ({ email: 'test@', surname: 'surname', forename: 'forename', roles: ['fact-admin'], isInvalidFormat: true})
    };

    expect(res.render).toBeCalledWith('users/tabs/inviteUserContent',pageData);
  });

  test('Should POST account details and render password view', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'user': user
    };
    await controller.postUserInvite(req, res);

    const pageData: PasswordPageData = {
      errors: Array.of(),
      user : JSON.stringify(user)
    };

    expect(res.render).toBeCalledWith('users/tabs/password',pageData);
  });

  test('Should render the invite successful user page', async () => {

    await controller.renderInviteSuccessful(req, res);


    expect(res.render).toBeCalledWith('users/tabs/inviteSuccessful');
  });

  test('Should POST account details and render invite successful view when valid password is entered', async () => {
    req.body = {
      '_csrf': CSRF.create(),
      'user': JSON.stringify(user),
      'error': false,
    };

    await controller.postPassword(req, res);

    expect(mockApi.registerUser).toBeCalled();
    expect(res.render).toBeCalledWith('users/tabs/inviteSuccessful');

  });

  test('should not post account to API calls when password is invalid ', async () => {

    req.body = {
      '_csrf': CSRF.create(),
      'user': JSON.stringify(user),
      'error': 'true'
    };


    await controller.postPassword(req, res);

    const pageData: PasswordPageData = {
      errors: [{ text: controller.invalidPasswordMsg }],
      user: JSON.stringify(user)
    };
    expect(res.render).toBeCalledWith('users/tabs/password', pageData);

  });

  test('should not post account to  API calls when invalid csrf token ', async () => {

    req.body = {
      '_csrf': '',
      'user': JSON.stringify(user)
    };
    CSRF.verify = jest.fn().mockReturnValue(false);

    await controller.postPassword(req, res);

    const pageData: PasswordPageData = {
      errors: [{ text: controller.updateErrorMsg }],
      user: JSON.stringify(user)
    };
    expect(res.render).toBeCalledWith('users/tabs/password', pageData);

  });

  test('should handle failed API calls when posting account ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500; // An internal server error
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'user': JSON.stringify(user),
      'error': false,
    };

    CSRF.verify = jest.fn().mockReturnValue(true);
    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.updateErrorMsg }],
      updated: false,
      user : user
    };
    expect(res.render).toBeCalledWith('users/tabs/inviteUserContent', pageData);

  });


  test('should display duplicated message when account already exists ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 409;
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'user': JSON.stringify(user),
      'error': false,
    };

    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.duplicatedErrorMsg }],
      updated: false,
      user : user
    };
    expect(res.render).toBeCalledWith('users/tabs/inviteUserContent', pageData);

  });


  test('should display message when admin tries invite a super admin ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 403;
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'user': JSON.stringify(user),
      'error': false,
    };

    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.forbiddenErrorMsg }],
      updated: false,
      user : user
    };
    expect(res.render).toBeCalledWith('users/tabs/inviteUserContent', pageData);

  });

  test('should display message when account information missing ', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.idamApi.registerUser = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      '_csrf': CSRF.create(),
      'user': JSON.stringify(user),
      'error': false,
    };

    await controller.postPassword(req, res);

    const pageData: AddUserPageData = {
      errors: [{ text: controller.forbiddenErrorMsg }],
      updated: false,
      user : user
    };
    expect(res.render).toBeCalledWith('users/tabs/inviteUserContent', pageData);

  });
});
