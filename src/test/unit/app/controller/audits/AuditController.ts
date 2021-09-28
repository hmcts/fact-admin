import {Action, Audit, AuditPageData} from '../../../../../main/types/Audit';
import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {AuditController} from '../../../../../main/app/controller/audits/AuditController';

describe ( 'AuditController', () => {

  let mockApi: {
    getAudits: () => Promise<Audit[]>,
    getCourts: () => Promise<object[]>
  };

  const controller = new AuditController();

  const getAudits: () => Audit[] = () => [
    { id: 1, action: { name: 'test', id : 1  } as Action,
      // eslint-disable-next-line @typescript-eslint/camelcase
      creation_time: '2/1/2001, 12:00:00 AM', action_data_after: 'data after', action_data_before: 'data before', location: 'location', user_email: 'user email'},
    { id: 2, action: { name: 'test 2', id : 2  } as Action,
      // eslint-disable-next-line @typescript-eslint/camelcase
      creation_time: '3/1/2001, 12:00:00 AM', action_data_after: 'data after 2', action_data_before: 'data before 2', location: 'location 2', user_email: 'user email 2'}
  ];

  beforeEach(() => {
    mockApi = {
      getAudits: async (): Promise<Audit[]> => getAudits(),
      getCourts: async (): Promise<object[]> => []
    };

    jest.spyOn(mockApi, 'getAudits');
    jest.spyOn(mockApi, 'getCourts');
  });

  test('Should get audits view and render the page', async () => {
    const res = mockResponse();
    await controller.get(mockRequest(), res);
    expect(res.render).toBeCalledWith('audits/index');
  });

  test('Should get audit data', async () => {
    const req = mockRequest();
    req.query = {
      page: 1,
      location: 'location',
      email: 'email',
      dateFrom: 'date from',
      dateTo: 'date to'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.getAuditData(req, res);

    const expectedResults: AuditPageData = {
      audits: getAudits(),
      courts: [],
      errors: [],
      currentPage: 1,
      searchOptions: {
        username: 'email',
        location: 'location',
        dateFrom: 'date from',
        dateTo: 'date to'
      }
    };
    expect(res.render).toBeCalledWith('audits/auditContent', expectedResults);
  });

  test('Should get audit data with empty search values', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.getAuditData(req, res);

    const expectedResults: AuditPageData = {
      audits: getAudits(),
      courts: [],
      errors: [],
      currentPage: 0,
      searchOptions: {
        username: '',
        location: '',
        dateFrom: '',
        dateTo: ''
      }
    };
    expect(res.render).toBeCalledWith('audits/auditContent', expectedResults);
  });

  test('Should get date error when before date after to date', async () => {
    const req = mockRequest();
    req.query = {
      page: 1,
      location: 'location',
      email: 'email',
      dateFrom: '3/1/2001, 12:00:00 AM',
      dateTo: '2/1/2001, 12:00:00 AM'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.getAuditData(req, res);

    const expectedResults: AuditPageData = {
      audits: null,
      courts: [],
      errors: [{text: controller.afterDateBeforeToDateError}],
      currentPage: 1,
      searchOptions: {
        location: 'location',
        username: 'email',
        dateFrom: '3/1/2001, 12:00:00 AM',
        dateTo: '2/1/2001, 12:00:00 AM'
      }
    };
    expect(res.render).toBeCalledWith('audits/auditContent', expectedResults);
  });

  test('Should get date error when only one date search populated', async () => {
    const req = mockRequest();
    req.query = {
      page: 1,
      location: 'location',
      email: 'email',
      dateFrom: '',
      dateTo: 'date to'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.getAuditData(req, res);

    const expectedResults: AuditPageData = {
      audits: null,
      courts: [],
      errors: [{text: controller.bothDateToAndFromErrorMsg}],
      currentPage: 1,
      searchOptions: {
        location: 'location',
        username: 'email',
        dateFrom: '',
        dateTo: 'date to'
      }
    };
    expect(res.render).toBeCalledWith('audits/auditContent', expectedResults);
  });

  test('Should not get audit data if api error when getting courts', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourts = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();
    await controller.getAuditData(req, res);

    const expectedResults: AuditPageData = {
      audits: null,
      courts: null,
      errors: [{text: controller.getCourtsErrorMsg}],
      currentPage: 0,
      searchOptions: {
        username: '',
        location: '',
        dateFrom: '',
        dateTo: ''
      }
    };
    expect(res.render).toBeCalledWith('audits/auditContent', expectedResults);
  });

  test('Should not get audit data if api error when getting audits', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getAudits = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();
    await controller.getAuditData(req, res);

    const expectedResults: AuditPageData = {
      audits: null,
      courts: [],
      errors: [{text: controller.getAuditsErrorMsg}],
      currentPage: 0,
      searchOptions: {
        username: '',
        location: '',
        dateFrom: '',
        dateTo: ''
      }
    };
    expect(res.render).toBeCalledWith('audits/auditContent', expectedResults);
  });
});
