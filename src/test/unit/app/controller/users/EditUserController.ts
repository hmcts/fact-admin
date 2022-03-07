import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import {EditUserPageData, SearchUserPageData} from '../../../../../main/types/UserPageData';
import {CSRF} from '../../../../../main/modules/csrf';
import {User} from '../../../../../main/types/User';
import {EditUserController} from '../../../../../main/app/controller/users/EditUserController';

describe('EditUserController', () => {

  let mockApi: {
    getUserByEmail: (email: string, accessToken: string) => Promise<User>,
    updateUserDetails(userId: string, forename: string, surname: string, accessToken: string): Promise<User>,
    grantUserRole(userId: string, role: object, accessToken: string): Promise<User>,
    removeUserRole(userId: string, roleName: string, accessToken: string): Promise<User>
  };

  const user: User = { email: 'name@test.com', surname: 'surname', forename: 'forename', roles: ['fact-admin']};
  const updatedUserName: User = { email: 'name@test.com', surname: 'newSurname', forename: 'newForename', roles: ['fact-admin']};
  const updatedUserRole: User = { email: 'name@test.com', surname: 'newSurname', forename: 'newForename', roles: ['fact-super-admin']};
  const updatedUserRemovedRole: User = { email: 'name@test.com', surname: 'newSurname', forename: 'newForename', roles: []};
  const email = 'name@test.com';
  const userId = 'testId';
  const updatedForename = 'newForename';
  const updatedSurname = 'newSurname';
  const role = [{'name': 'fact-admin'}];
  const updatedRole = [{'name': 'fact-super-admin'}];

  const controller = new EditUserController();
  const res = mockResponse();
  const req = mockRequest();
  CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
  CSRF.verify = jest.fn().mockReturnValue(true);

  const getUserByEmail: () => User = () => user;
  const updateUserDetails: () => User = () => user;
  const grantUserRole: () => User = () => user;
  const removeUserROle: () => User = () => user;

  beforeEach(() => {
    mockApi = {
      getUserByEmail: async (): Promise<User> => getUserByEmail(),
      updateUserDetails: async (): Promise<User> => updateUserDetails(),
      grantUserRole: async (): Promise<User> => grantUserRole(),
      removeUserRole: async (): Promise<User> => removeUserROle()
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    req.scope.cradle.idamApi = mockApi;
    req.session.user.accessToken = 'accessToken';

    jest.spyOn(mockApi, 'getUserByEmail');
    jest.spyOn(mockApi, 'updateUserDetails');
    jest.spyOn(mockApi, 'grantUserRole');
    jest.spyOn(mockApi, 'removeUserRole');
  });

  test('Should render the search user page', async () => {

    await controller.renderSearchUser(req, res);

    const pageData: SearchUserPageData = {
      errors: [],
      userEmail: '',
      updated: false,
      userRolesRemoved: false
    };

    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
  });

  test('Should render the edit user page with user', async () => {

    await controller.renderEditUser(req, res);

    const pageData: EditUserPageData = {
      errors: [],
      user: null
    };

    expect(res.render).toBeCalledWith('users/tabs/editUserContent', pageData);
  });

  test('Should get user details and render edit page', async () => {
    req.query = {
      userEmail: email
    };

    await controller.getUser(req, res);

    const pageData: EditUserPageData = {
      errors: [],
      user : user
    };

    expect(res.render).toBeCalledWith('users/tabs/editUserContent', pageData);
    expect(mockApi.getUserByEmail).toBeCalled();
  });

  test('Should get user details and render edit page', async () => {
    req.query = {
      userEmail: email
    };
    req.scope.cradle.idamApi.getUserByEmail = jest.fn().mockResolvedValue(user);

    await controller.getUser(req, res);

    const pageData: EditUserPageData = {
      errors: [],
      user : user
    };

    expect(res.render).toBeCalledWith('users/tabs/editUserContent', pageData);
    expect(mockApi.getUserByEmail).toBeCalled();
  });

  test('Should display an error if user is undefined', async () => {
    req.query = {
      userEmail: email
    };
    req.scope.cradle.idamApi.getUserByEmail = jest.fn().mockResolvedValue(undefined);

    await controller.getUser(req, res);

    const pageData: SearchUserPageData = {
      errors: [{ text: 'No account was found with the email address: ' + email }],
      userEmail: email,
      updated: false,
      userRolesRemoved: false
    };

    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
    expect(mockApi.getUserByEmail).toBeCalled();
  });

  test('Should display an error when getting user and IDAM returns an error', async () => {
    req.query = {
      userEmail: email
    };
    req.scope.cradle.idamApi.getUserByEmail = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.getUser(req, res);

    const pageData: SearchUserPageData = {
      errors: [{ text: 'A problem occurred when searching for the user. ' }],
      userEmail: email,
      updated: false,
      userRolesRemoved: false
    };

    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
    expect(mockApi.getUserByEmail).toBeCalled();
  });

  test('Should update user forename and surname', async () => {
    req.body = {
      userId: userId,
      userEmail: email,
      forename: updatedForename,
      surname: updatedSurname,
      role: role
    };

    req.scope.cradle.idamApi.getUserByEmail = jest.fn().mockResolvedValue(user);
    req.scope.cradle.idamApi.updateUserDetails = jest.fn().mockResolvedValue(updatedUserName);

    await controller.patchUser(req, res);

    const pageData: SearchUserPageData = {
      errors: [],
      userEmail: '',
      updated: true,
      userRolesRemoved: false
    };

    expect(mockApi.getUserByEmail).toBeCalled();
    expect(mockApi.updateUserDetails).toBeCalled();
    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
  });

  test('Should update user role', async () => {
    req.body = {
      userId: userId,
      userEmail: email,
      forename: updatedForename,
      surname: updatedSurname,
      role: updatedRole
    };

    req.scope.cradle.idamApi.getUserByEmail = jest.fn().mockResolvedValue(user);
    req.scope.cradle.idamApi.updateUserDetails = jest.fn().mockResolvedValue(updatedUserRole);

    await controller.patchUser(req, res);

    const pageData: SearchUserPageData = {
      errors: [],
      userEmail: '',
      updated: true,
      userRolesRemoved: false
    };

    expect(mockApi.getUserByEmail).toBeCalled();
    expect(mockApi.updateUserDetails).toBeCalled();
    expect(mockApi.grantUserRole).toBeCalled();
    expect(mockApi.removeUserRole).toBeCalled();
    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
  });

  test('Should not patch user if IDAM returns an error', async () => {
    req.body = {
      userId: userId,
      userEmail: email,
      forename: updatedForename,
      surname: updatedSurname,
      role: updatedRole
    };

    req.scope.cradle.idamApi.getUserByEmail = jest.fn().mockResolvedValue(user);
    req.scope.cradle.idamApi.updateUserDetails = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.patchUser(req, res);

    const pageData: SearchUserPageData = {
      errors: [{ text: 'A problem occurred when editing the user. ' }],
      userEmail: '',
      updated: false,
      userRolesRemoved: false
    };

    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
    expect(mockApi.getUserByEmail).toBeCalled();
    expect(mockApi.updateUserDetails).toBeCalled();
  });

  test('Should render delete user roles confirmation page', async () => {
    req.params = {
      userId: userId,
      userEmail: email,
      userRole: user.roles
    };

    await controller.getDeleteConfirmation(req, res);

    const pageData = {
      userId: req.query.userId,
      userEmail: req.query.userEmail,
      userRole: req.query.userRole
    };

    expect(res.render).toBeCalledWith('users/tabs/deleteUserConfirm', pageData);
  });

  test('Should delete user roles of user', async () => {
    req.body = { userRole: user.roles };
    req.params = { userId: userId };

    req.scope.cradle.idamApi.removeUserRole = jest.fn().mockResolvedValue(updatedUserRemovedRole);

    await controller.removeUserRole(req, res);

    const pageData: SearchUserPageData = {
      errors: [],
      userEmail: '',
      updated: false,
      userRolesRemoved: true
    };

    expect(mockApi.removeUserRole).toBeCalled();
    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
  });

  test('Should remove user roles if IDAM returns an error', async () => {
    req.body = { userRole: user.roles };
    req.params = { userId: userId };

    req.scope.cradle.idamApi.removeUserRole = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.removeUserRole(req, res);

    const pageData: SearchUserPageData = {
      errors: [{ text: 'A problem occurred when editing the user. ' }],
      userEmail: '',
      updated: false,
      userRolesRemoved: false
    };

    expect(mockApi.removeUserRole).toBeCalled();
    expect(res.render).toBeCalledWith('users/tabs/searchUserContent', pageData);
  });
});
