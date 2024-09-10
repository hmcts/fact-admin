import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import { LogoutController } from '../../../../main/app/controller/LogoutController';

describe('LogoutController', () => {
  let req: any, res: any, mockDeleteCourtLocksByEmail: jest.Mock, mockOidcLogout: jest.Mock;

  beforeEach(() => {
    mockDeleteCourtLocksByEmail = jest.fn().mockResolvedValue(true);
    mockOidcLogout = jest.fn().mockResolvedValue(undefined);

    req = mockRequest();
    req.appSession = { user: { jwt: { sub: 'test-user@justice.gov.uk' } } };
    req.scope = { cradle: { api: { deleteCourtLocksByEmail: mockDeleteCourtLocksByEmail } } };

    res = mockResponse();
    res.oidc = { logout: mockOidcLogout };
  });

  test('Should remove court locks and perform logout', async () => {
    const controller = new LogoutController();

    await controller.get(req, res);

    expect(mockDeleteCourtLocksByEmail).toHaveBeenCalledWith('test-user@justice.gov.uk');
    expect(mockOidcLogout).toHaveBeenCalled();
  });
});

