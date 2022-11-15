import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {OpeningTimesController} from '../../../../../main/app/controller/courts/OpeningTimesController';
import {OpeningTime, OpeningTimeData} from '../../../../../main/types/OpeningTime';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {OpeningType} from '../../../../../main/types/OpeningType';
import {CSRF} from '../../../../../main/modules/csrf';

describe('OpeningTimesController', () => {

  let mockApi: {
    getOpeningTimes: () => Promise<OpeningTime[]>;
    updateOpeningTimes: () => Promise<OpeningTime[]>;
    getOpeningTimeTypes: () => Promise<OpeningType[]>;};

  const getOpeningTimes: () => OpeningTime[] = () => [
    { 'type_id': 1, hours: '9am to 5pm', isNew: false },
    { 'type_id': 2, hours: '9am to 1pm', isNew: false },
    { 'type_id': 3, hours: '10am to 4pm', isNew: false }
  ];

  const openingTimeTypes: OpeningType[] = [
    { id: 1, type: 'Telephone enquiries answered', 'type_cy': 'Oriau ateb ymholiadau dros y ffôn'},
    { id: 2, type: 'Bailiff office open', 'type_cy': 'Oriau agor swyddfar Beiliaid'},
    { id: 3, type: 'Counter open', 'type_cy': 'Oriau agor y cownter'}
  ];

  const expectedSelectItems: SelectItem[] = [
    { value: 1,
      text: 'Telephone enquiries answered',
      selected: false },
    { value: 2,
      text: 'Bailiff office open',
      selected: false },
    { value: 3,
      text: 'Counter open',
      selected: false },
  ];

  const controller = new OpeningTimesController();

  beforeEach(() => {
    mockApi = {
      getOpeningTimes: async (): Promise<OpeningTime[]> => getOpeningTimes(),
      updateOpeningTimes: async (): Promise<OpeningTime[]> => getOpeningTimes(),
      getOpeningTimeTypes: async (): Promise<OpeningType[]> => openingTimeTypes
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get opening times view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    // Empty entry expected for adding new opening time
    const expectedOpeningTimes = getOpeningTimes().concat([{ 'type_id': null, hours: null, isNew: true }]);

    const expectedResults: OpeningTimeData = {
      'opening_times': expectedOpeningTimes,
      openingTimeTypes: expectedSelectItems,
      updated: false,
      errors: [],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });

  test('Should post opening times if opening times are valid', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'opening_times': getOpeningTimes(),
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockResolvedValue(getOpeningTimes());

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateOpeningTimes).toBeCalledWith(slug, getOpeningTimes());
  });

  test('Should not post opening times if description or hours field is empty', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedOpeningTimes: OpeningTime[] = [
      { 'type_id': 1, hours: '9am to 5pm' },
      { 'type_id': null, hours: '9am to 1pm' }
    ];

    req.body = {
      'opening_times': postedOpeningTimes,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if opening times data is incomplete
    expect(mockApi.updateOpeningTimes).not.toBeCalled();
  });

  test('Should not post opening times if descriptions are duplicated', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedOpeningTimes: OpeningTime[] = getOpeningTimes().concat([{ 'type_id': 2, hours: '10am to 5pm', isNew: true }]);
    req.body = {
      'opening_times': postedOpeningTimes,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);
    expect(mockApi.updateOpeningTimes).not.toBeCalled();
  });

  test('Should not post opening times if CSRF token is invalid', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedOpeningTimes: OpeningTime[] = [
      { 'type_id': 1, hours: '9am to 5pm' },
      { 'type_id': 2, hours: '9am to 1pm' }
    ];
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    req.body = {
      'opening_times': postedOpeningTimes,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockReturnValue(res);

    const expectedResults: OpeningTimeData = {
      'opening_times': postedOpeningTimes,
      openingTimeTypes: expectedSelectItems,
      updated: false,
      errors: [{text: controller.updateErrorMsg}],
      fatalError: false
    };

    await controller.put(req, res);

    // Should not call API if opening times data is incomplete
    expect(mockApi.updateOpeningTimes).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });

  test('Should handle errors when getting opening time data from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getOpeningTimes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: OpeningTimeData = {
      'opening_times': null,
      openingTimeTypes: expectedSelectItems,
      updated: false,
      errors: [{text: controller.getOpeningTimesErrorMsg}],
      fatalError: true,
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });

  test('Should handle errors when getting opening time types from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getOpeningTimeTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    // Empty entry expected for adding new opening time
    const expectedOpeningTimes = getOpeningTimes().concat([{ 'type_id': null, hours: null, isNew: true }]);

    const expectedResults: OpeningTimeData = {
      'opening_times': expectedOpeningTimes,
      openingTimeTypes: [],
      updated: false,
      errors: [{text: controller.getOpeningTypesErrorMsg}],
      fatalError: true,
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });

  test('Should handle error with duplicated descriptions when updating opening time', async () => {
    const req = mockRequest();
    const postedOpeningTimes: OpeningTime[] = getOpeningTimes().concat([{ 'type_id': 2, hours: '10am to 5pm', isNew: true }]);
    req.params = { slug: 'southport-county-court' };
    req.body = {
      'opening_times': postedOpeningTimes,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);

    const expectedResults: OpeningTimeData = {
      'opening_times': postedOpeningTimes,
      openingTimeTypes: expectedSelectItems,
      updated: false,
      errors: [{text: controller.openingTimeDuplicatedErrorMsg}],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });

  test('Should handle multiple errors when updating opening time', async () => {
    const req = mockRequest();
    const postedOpeningTimes: OpeningTime[] = getOpeningTimes()
      .concat([{ 'type_id': 2, hours: '10am to 5pm', isNew: true }])
      .concat([{ 'type_id': 1, hours: '', isNew: true }]);
    req.params = { slug: 'southport-county-court' };
    req.body = {
      'opening_times': postedOpeningTimes,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);

    const expectedResults: OpeningTimeData = {
      'opening_times': postedOpeningTimes,
      openingTimeTypes: expectedSelectItems,
      updated: false,
      errors: [
        {text: controller.emptyTypeOrHoursErrorMsg},
        {text: controller.openingTimeDuplicatedErrorMsg}
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });

  test('Should handle conflict errors when updating opening time', async () => {
    const req = mockRequest();
    const res = mockResponse();
    res.response.status = 409;
    res.response.data = {'message': 'test'}
    req.params = { slug: 'southport-county-court' };
    req.body = {
      'opening_times': [{}],
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockRejectedValue(res);

    await controller.put(req, res);

    const expectedResults: OpeningTimeData = {
      'opening_times': [{'hours': null, 'isNew': true, 'type_id': null}],
      openingTimeTypes: expectedSelectItems,
      updated: false,
      errors: [
        {text: controller.courtLockedExceptionMsg + 'test'}
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });
});
