import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EditCourtController} from '../../../../../main/app/controller/courts/EditCourtController';
import {CourtPageData} from '../../../../../main/types/CourtPageData';
import config from 'config';
import {when} from 'jest-when';
import Tokens from 'csrf';

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
    const featureFlags = {};
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
    };
    const res = mockResponse();
    res.locals.isViewer = false;
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
    expect(mockApi.addCourtLock).toHaveBeenCalled();
  });

  test('Should get court and render the edit court page as super admin if lock user the same', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {};
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
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should return error if court lock user is different and time condition not met', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {};
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
    const featureFlags = {};
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
    };
    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page as admin', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {};
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
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render for viewer but not try to add a court lock when there is none', async () => {
    const newMockApi = {
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

    newMockApi.getCourts = jest.fn();
    newMockApi.getCourt = jest.fn();
    newMockApi.getAllFlagValues = jest.fn();
    newMockApi.getCourtLocks = jest.fn();
    newMockApi.addCourtLock = jest.fn();

    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {};
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(newMockApi.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(newMockApi.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([]);
    when(newMockApi.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = false;
    req.scope.cradle.api = newMockApi;
    req.scope.cradle.featureFlags = newMockApi;


    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
    };
    const res = mockResponse();
    res.locals.isViewer = true;
    await controller.get(req, res);


    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
    expect(newMockApi.addCourtLock).not.toHaveBeenCalled();
  });

  test('Should render page for viewer user when there is a court lock and time condition not met', async () => {
    const mockApi2 = {
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

    mockApi2.getCourts = jest.fn();
    mockApi2.getCourt = jest.fn();
    mockApi2.getAllFlagValues = jest.fn();
    mockApi2.getCourtLocks = jest.fn();
    mockApi2.addCourtLock = jest.fn();
    mockApi2.deleteCourtLocks = jest.fn();

    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {};
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi2.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([{
      'id': 1,
      'lock_acquired': '2129-11-14 15:54:34.242539',
      'user_email': 'moshuser2',
      'court_slug': 'royal-courts-of-justice'
    }]);
    when(mockApi2.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi2.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = false;
    req.scope.cradle.api = mockApi2;
    req.scope.cradle.featureFlags = mockApi2;

    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
    };

    const res = mockResponse();
    res.locals.isViewer = true;
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
    expect(mockApi2.addCourtLock).not.toHaveBeenCalled();
  });

  test('Should not add a court lock for viewer when existing court lock has expired', async () => {
    const mockApi3 = {
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

    mockApi3.getCourts = jest.fn();
    mockApi3.getCourt = jest.fn();
    mockApi3.getAllFlagValues = jest.fn();
    mockApi3.getCourtLocks = jest.fn();
    mockApi3.addCourtLock = jest.fn();
    mockApi3.deleteCourtLocks = jest.fn();

    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const featureFlags = {};
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);
    when(mockApi3.getCourt as jest.Mock).calledWith(slug).mockReturnValue({name: name});
    when(mockApi3.getCourtLocks as jest.Mock).calledWith(slug).mockReturnValue([{
      'id': 1,
      'lock_acquired': '2000-11-14 15:54:34.242539',
      'user_email': 'moshuser2',
      'court_slug': 'royal-courts-of-justice'
    }]);
    when(mockApi3.getAllFlagValues as jest.Mock).mockReturnValue(featureFlags);

    req.params = {slug: slug};
    req.query = {name: name};
    req.appSession.user.isSuperAdmin = false;
    req.scope.cradle.api = mockApi3;
    req.scope.cradle.featureFlags = mockApi3;

    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name,
      csrfToken: expect.any(String),
    };

    const res = mockResponse();
    res.locals.isViewer = true;
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
    expect(mockApi3.addCourtLock).not.toHaveBeenCalled();
    expect(mockApi3.deleteCourtLocks).not.toHaveBeenCalled();
  });
});
