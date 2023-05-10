// import {IdamApi} from '../../../../main/app/fact/IdamApi';
// import {User} from '../../../../main/types/User';
//
//
// describe('IdamApi', () => {
//   const mockError = new Error('Error') as any;
//   mockError.response = {
//     data: 'something failed',
//     headers: {},
//     status: 403,
//     statusText: 'Failed'
//   };
//
//   const mockLogger = {
//     error: (message: string) => message,
//     info: (message: string) => message
//   } as any;
//
//
//   test('Should post register user request', async () => {
//     const result: { data: User } = { data: { email: 'name@test.com', surname: 'surname', forename: 'forename', roles: ['fact-admin']}};
//
//     const mockAxios = { post: async () => result } as never;
//     const api = new IdamApi(mockAxios, mockLogger);
//     await expect(api.registerUser(result.data,'accessToken')).resolves.toEqual(result.data);
//   });
//
//   test('Should log error and reject promise for failed register user request', async () => {
//     const result: { data: User } = { data: { email: 'name@test.com', surname: 'surname', forename: 'forename', roles: ['fact-admin']}};
//
//     const mockAxios = { post: async () => { throw mockError; }} as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//
//     await expect(api.registerUser(result.data, 'accessToken')).rejects.toBe(mockError);
//   });
//
//   test('Should get user by email', async () => {
//     const result: { data: User[] } = { data: [{ email: 'name@test.com', surname: 'surname', forename: 'forename', roles: ['fact-admin']}]};
//
//     const mockAxios = { get: async () => result } as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//     await expect(api.getUserByEmail('name@test.com','accessToken')).resolves.toEqual(result.data[0]);
//   });
//
//   test('Should log error and reject promise for failed get user by email request', async () => {
//     const email = 'name@test.com';
//
//     const mockAxios = { get: async () => { throw mockError; }} as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//
//     await expect(api.getUserByEmail(email,'accessToken')).rejects.toBe(mockError);
//   });
//
//   test('Should update user details', async () => {
//     const result: { data: User } = { data: { email: 'name@test.com', surname: 'surname', forename: 'forename', roles: ['fact-admin']}};
//
//     const mockAxios = { patch: async () => result } as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//     await expect(api.updateUserDetails('userId', 'forename', 'surname', 'accessToken')).resolves.toEqual(result.data);
//   });
//
//   test('Should log error and reject promise for failed update user details request', async () => {
//
//     const mockAxios = { patch: async () => { throw mockError; }} as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//
//     await expect(api.updateUserDetails('userId', 'forename', 'surname', 'accessToken')).rejects.toBe(mockError);
//   });
//
//   test('Should grant user role', async () => {
//     const result: { data: User } = { data: { email: 'name@test.com', surname: 'surname', forename: 'forename', roles: ['fact-admin']}};
//
//     const mockAxios = { post: async () => result } as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//     await expect(api.grantUserRole('userId', {'name': 'fact-admin'}, 'accessToken')).resolves.toEqual(result.data);
//   });
//
//   test('Should log error and reject promise for failed grant user role request', async () => {
//
//     const mockAxios = { post: async () => { throw mockError; }} as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//
//     await expect(api.grantUserRole('userId', {'name': 'fact-admin'}, 'accessToken')).rejects.toBe(mockError);
//   });
//
//   test('Should delete user role', async () => {
//     const result: { data: User } = { data: { email: 'name@test.com', surname: 'surname', forename: 'forename', roles: []}};
//
//     const mockAxios = { delete: async () => result } as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//     await expect(api.removeUserRole('userId', 'fact-admin', 'accessToken')).resolves.toEqual(result.data);
//   });
//
//   test('Should log error and reject promise for failed delete user role request', async () => {
//
//     const mockAxios = { delete: async () => { throw mockError; }} as any;
//     const api = new IdamApi(mockAxios, mockLogger);
//
//     await expect(api.removeUserRole('userId', 'fact-admin', 'accessToken')).rejects.toBe(mockError);
//   });
//
// });
