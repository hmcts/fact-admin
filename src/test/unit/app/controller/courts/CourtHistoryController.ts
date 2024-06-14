import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {CourtHistory, CourtHistoryData} from "../../../../../main/types/CourtHistory";
import { CourtHistoryController } from '../../../../../main/app/controller/courts/CourtHistoryController';

describe('CourtHistoryController', () => {

  let mockApi: {
    getCourtHistory: () => Promise<CourtHistory[]>;
    updateCourtHistory: () => Promise<CourtHistory[]>;
  };

  const getCourtHistory: () => CourtHistory[] = () => [
    {
      court_name: 'an old court', court_name_cy: 'an old court cy', isNew: false
    },
    {
      court_name: 'another old court', court_name_cy: 'another old court cy', isNew: false
    }
  ];

  const courtHistoryWithEmptyEntry: CourtHistory[] =
    getCourtHistory().concat({ court_name: null, court_name_cy: null, isNew: true });

  const courtHistoryInvalidSyntax: CourtHistory[] = [
    { court_name: '', court_name_cy: '' },
    { court_name: '', court_name_cy: 'a court cy'},
    { court_name: null, court_name_cy: null}
  ];

  const controller = new CourtHistoryController();

  beforeEach(() => {
    mockApi = {
      getCourtHistory: async (): Promise<CourtHistory[]> => getCourtHistory(),
      updateCourtHistory: async (): Promise<CourtHistory[]> => getCourtHistory()
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get court history view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'central-london-county-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtHistoryData = {
      courtHistory: courtHistoryWithEmptyEntry,
      updated: false,
      errors: [],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/courtHistoryContent', expectedResults);
  });

  test('Should post court history if the fields are valid', async () => {
    const slug = 'central-london-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'courtHistory': getCourtHistory(),
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtHistory = jest.fn().mockResolvedValue(getCourtHistory());

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtHistory).toBeCalledWith(slug, getCourtHistory());
  });

  test('Should not post court history if name field is empty', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedCourtHistory: CourtHistory[] = [
      { court_name: '', court_name_cy: '' },
      { court_name: '', court_name_cy: 'a court cy'},
    ];

    req.body = {
      'courtHistory': postedCourtHistory,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtHistory = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if court history data is incomplete
    expect(mockApi.updateCourtHistory).not.toBeCalled();
  });

  test('Should not post court history if CSRF token is invalid', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: 'central-london-county-court'
    };
    req.body = {
      'courtHistory': courtHistoryInvalidSyntax,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtHistory = jest.fn().mockReturnValue(res);
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    await controller.put(req, res);

    const expectedResults: CourtHistoryData = {
      courtHistory: courtHistoryInvalidSyntax,
      updated: false,
      errors: [{text: controller.updateErrorMsg}],
      fatalError: false
    };
    expect(mockApi.updateCourtHistory).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/courtHistoryContent', expectedResults);
  });

  test('Should handle historical name blank error when getting court history data from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'central-london-county-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtHistory = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtHistoryData = {
      courtHistory: null,
      updated: false,
      errors: [{text: controller.getCourtHistoryErrorMsg}],
      fatalError: true
    };
    expect(res.render).toBeCalledWith('courts/tabs/courtHistoryContent', expectedResults);
  });

  test('Should handle multiple errors when updating court history', async () => {
    const req = mockRequest();
    const postedCourtHistory: CourtHistory[] = getCourtHistory()
      .concat({ court_name: '', court_name_cy: 'a cy', isNew: true })
      .concat({ court_name: '', court_name_cy: 'b cy', isNew: true });

    req.params = { slug: 'central-london-county-court' };
    req.body = {
      'courtHistory': postedCourtHistory,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtHistory = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);

    const expectedResults: CourtHistoryData = {
      'courtHistory': postedCourtHistory,
      updated: false,
      errors: [
        {text: controller.emptyCourtNameErrorMsg, href: "#historicalName-3"},
        {text: controller.emptyCourtNameErrorMsg, href: "#historicalName-4"},
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/courtHistoryContent', expectedResults);
  });

  test('Should handle conflict errors when updating court history', async () => {
    const req = mockRequest();
    const postedCourtHistory: CourtHistory[] = [];
    const res = mockResponse();
    res.response.status = 409;
    res.response.data = {'message': 'test'};

    req.params = { slug: 'central-london-county-court' };
    req.body = {
      'courtHistory': postedCourtHistory,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtHistory = jest.fn().mockRejectedValue(res);

    await controller.put(req, res);

    const expectedResults: CourtHistoryData = {
      'courtHistory': [{ court_name: null, court_name_cy: null, isNew: true}],
      updated: false,
      errors: [
        {text: controller.courtLockedExceptionMsg + 'test'}
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/courtHistoryContent', expectedResults);
  });
});
