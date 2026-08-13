import {restrictRetiredServiceAccess} from '../../../../../main/modules/oidc';
import {mockResponse} from '../../../utils/mockResponse';

describe('restrictRetiredServiceAccess', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('redirects a non-super-admin user away from existing application routes', () => {
    const req = {path: '/courts'} as any;
    const res = mockResponse();
    res.locals.isSuperAdmin = false;

    restrictRetiredServiceAccess(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith('/use-new-service');
    expect(next).not.toHaveBeenCalled();
  });

  test('allows a super-admin user to continue to existing application routes', () => {
    const req = {path: '/courts'} as any;
    const res = mockResponse();
    res.locals.isSuperAdmin = true;

    restrictRetiredServiceAccess(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test.each(['/use-new-service', '/logout'])(
    'allows a non-super-admin user to access %s',
    (path) => {
      const req = {path} as any;
      const res = mockResponse();
      res.locals.isSuperAdmin = false;

      restrictRetiredServiceAccess(req, res, next);

      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    }
  );
});
