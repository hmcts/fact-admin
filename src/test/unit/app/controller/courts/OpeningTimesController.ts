import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {OpeningTimesController} from '../../../../../main/app/controller/courts/OpeningTimesController';
import {OpeningTime, OpeningTimeData} from '../../../../../main/types/OpeningTime';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {OpeningType} from '../../../../../main/types/OpeningType';
import {CSRF} from '../../../../../main/modules/csrf';

describe('OpeningTimesController', () => {

  let mockApi: {
    getOpeningTimes: () => Promise<OpeningTime[]>,
    updateOpeningTimes: () => Promise<OpeningTime[]>,
    getOpeningTimeTypes: () => Promise<OpeningType[]> };

  const openingTimes: OpeningTime[] = [
    { 'type_id': 1, hours: '9am to 5pm' },
    { 'type_id': 2, hours: '9am to 1pm' },
    { 'type_id': 3, hours: '10am to 4pm' },
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
      getOpeningTimes: async (): Promise<OpeningTime[]> => openingTimes,
      updateOpeningTimes: async (): Promise<OpeningTime[]> => openingTimes,
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

    const expectedResults: OpeningTimeData = {
      'opening_times': openingTimes,
      openingTimeTypes: expectedSelectItems,
      updated: false,
      errorMsg: ''
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });

  test('Should post opening times if opening times are valid', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'opening_times': openingTimes,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateOpeningTimes = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateOpeningTimes).toBeCalledWith(slug, openingTimes);
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
      errorMsg: 'A problem occurred when saving the opening times.'
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
      errorMsg: controller.getOpeningTimesErrorMsg
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

    const expectedResults: OpeningTimeData = {
      'opening_times': openingTimes,
      openingTimeTypes: [],
      updated: false,
      errorMsg: controller.getOpeningTypesErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/openingHoursContent', expectedResults);
  });
});
