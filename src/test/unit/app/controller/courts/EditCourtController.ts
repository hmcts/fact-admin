import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EditCourtController} from '../../../../../main/app/controller/courts/EditCourtController';
import {CourtPageData} from '../../../../../main/types/CourtPageData';
import config from 'config';
import {when} from 'jest-when';
import Tokens from 'csrf';
import * as flags from '../../../../../main/app/feature-flags/flags';
import {ALL_FLAGS_FALSE_ERROR} from '../../../../../main/utils/error';

describe('EditCourtController', () => {
  const controller = new EditCourtController();
  const csrfToken = new Tokens().create('aRandomT0ken4You');
  jest.mock('config');
  config.get = jest.fn();
  const mockApi = {
    getCourts: () => {
    },
    getCourt: () => {
    },
    getAllFlagValues: () => {
    },
    getCourtLocks: () => {
    },
    addCourtLock: (slug: string, email: string) => {
    },
    deleteCourtLocks: (slug: string, email: string) => {
    }
  };

  mockApi.getCourts = jest.fn();
  mockApi.getCourt = jest.fn();
  mockApi.getAllFlagValues = jest.fn();
  mockApi.getCourtLocks = jest.fn();
  mockApi.addCourtLock = jest.fn();

  test('Should get court and render the edit court page as super admin', async () => {
    const req = mockRequest();
    //req.appSession.user.email = user;
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {
      'fact-admin-tab-emails': true,
      'fact-admin-tab-general': true,
      'fact-admin-tab-opening-hours': true,
      'fact-admin-tab-phone-numbers': true,
      'fact-admin-tab-types': true
    };
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([]);
    when(mockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = true;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.featureFlags = mockApi;

    const expectedResults: CourtPageData = {
      isSuperAdmin: true,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
      featureFlags: {values: featureFlags, flags: flags}
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page as super admin if lock user the same', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {
      'fact-admin-tab-emails': true,
      'fact-admin-tab-general': true,
      'fact-admin-tab-opening-hours': true,
      'fact-admin-tab-phone-numbers': true,
      'fact-admin-tab-types': true
    };
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([{
      'id': 1,
      'lock_acquired': '2022-11-14 15:54:34.242539',
      'user_email': 'moshuser',
      'court_slug': 'royal-courts-of-justice'
    }]);
    when(mockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = true;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.featureFlags = mockApi;

    const expectedResults: CourtPageData = {
      isSuperAdmin: true,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
      featureFlags: {values: featureFlags, flags: flags}
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should return error if court lock user is different and time condition not met', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {
      'fact-admin-tab-emails': true,
      'fact-admin-tab-general': true,
      'fact-admin-tab-opening-hours': true,
      'fact-admin-tab-phone-numbers': true,
      'fact-admin-tab-types': true
    };
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([{
      'id': 1,
      'lock_acquired': '2129-11-14 15:54:34.242539',
      'user_email': 'moshuser2',
      'court_slug': 'royal-courts-of-justice'
    }]);
    when(mockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = true;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.featureFlags = mockApi;

    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/courts', {'courts': undefined,
      'errors': [{'text': 'Royal Courts Of Justice is currently in use by moshuser2. '
        + 'Please contact them to finish their changes, or try again later.'}]});
  });

  test('Should switch locks with user if time period has expired', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {
      'fact-admin-tab-emails': true,
      'fact-admin-tab-general': true,
      'fact-admin-tab-opening-hours': true,
      'fact-admin-tab-phone-numbers': true,
      'fact-admin-tab-types': true
    };
    when(config.get as jest.Mock).calledWith('lock.timeout').mockReturnValue(1);
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([{
      'id': 1,
      'lock_acquired': '2000-11-14 15:54:34.242539',
      'user_email': 'moshuser2',
      'court_slug': 'royal-courts-of-justice'
    }]);
    when(mockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = true;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.featureFlags = mockApi;

    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtPageData = {
      isSuperAdmin: true,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
      featureFlags: {values: featureFlags, flags: flags}
    };
    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page as admin', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {
      'fact-admin-tab-emails': true,
      'fact-admin-tab-general': true,
      'fact-admin-tab-opening-hours': true,
      'fact-admin-tab-phone-numbers': true,
      'fact-admin-tab-types': true
    };
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([]);
    when(mockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = false;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.featureFlags = mockApi;

    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
      featureFlags: {values: featureFlags, flags: flags}
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page with error if flags are all off', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {
      'fact-admin-tab-emails': false,
      'fact-admin-tab-general': false,
      'fact-admin-tab-opening-hours': false,
      'fact-admin-tab-phone-numbers': false,
      'fact-admin-tab-types': false
    };
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([]);
    when(mockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = false;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.featureFlags = mockApi;

    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
      featureFlags: {values: featureFlags, flags: flags},
      error: {flagsError: {message: ALL_FLAGS_FALSE_ERROR}}
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page without error if flags are not retrievable', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {};
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([]);
    when(mockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = false;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.featureFlags = mockApi;

    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
      featureFlags: {values: {}, flags: flags}
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

});
