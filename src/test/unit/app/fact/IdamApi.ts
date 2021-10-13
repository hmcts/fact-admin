import {IdamApi} from '../../../../main/app/fact/IdamApi';
import {Account} from '../../../../main/types/Account';



describe('IdamApi', () => {
  const mockError = new Error('Error') as any;
  mockError.response = {
    data: 'something failed',
    headers: {},
    status: 403,
    statusText: 'Failed'
  };

  const mockLogger = {
    error: (message: string) => message,
    info: (message: string) => message
  } as any;


  test('Should post register user request', async () => {
    const result: { data: Account } = { data: { email: 'name@test.com', lastName: 'lastName', firstName: 'firstName', roles: ['fact-admin']}};

    const mockAxios = { post: async () => result } as never;
    const api = new IdamApi(mockAxios, mockLogger);
    await expect(api.registerUser(result.data,'accessToken')).resolves.toEqual(result.data);
  });

  test('Should log error and reject promise for failed register user request', async () => {
    const result: { data: Account } = { data: { email: 'name@test.com', lastName: 'lastName', firstName: 'firstName', roles: ['fact-admin']}};

    const mockAxios = { post: async () => { throw mockError; }} as any;
    const api = new IdamApi(mockAxios, mockLogger);

    await expect(api.registerUser(result.data, 'accessToken')).rejects.toBe(mockError);
  });

});
