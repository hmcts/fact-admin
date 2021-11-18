import {OpeningType} from '../../../../../main/types/OpeningType';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {mockRequest} from '../../../utils/mockRequest';
import {OpeningTypesController} from '../../../../../main/app/controller/lists/OpeningTypesController';

describe ( 'OpeningTypesController', () => {
  let mockApi: {
    getOpeningTimeTypes: () => Promise<OpeningType[]>,
    getOpeningType: (id: string) => Promise<OpeningType>,
    updateOpeningType: (ot: OpeningType) => Promise<OpeningType>,
    createOpeningType: (ot: OpeningType) => Promise<OpeningType>,
    deleteOpeningType: (id: string) => Promise<void>
  };

  let mockOpeningTypes: OpeningType[] = [];
  let req: any;
  const res = mockResponse();
  const controller = new OpeningTypesController();
  CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
  CSRF.verify = jest.fn().mockReturnValue(true);


  beforeEach(() => {
    mockOpeningTypes = [
      {
        id: 100,
        type: 'Type1',
        'type_cy':''
      },
      {
        id: 200,
        type: 'Type2',
        'type_cy':''
      },
      {
        id: 300,
        type: 'Type3',
        'type_cy':''
      }
    ];

    mockApi = {
      getOpeningType: (id: string) => Promise.resolve(mockOpeningTypes.filter(ct => ct.id.toString() === id.toString())[0]),
      getOpeningTimeTypes: () => Promise.resolve(mockOpeningTypes),
      createOpeningType: (ot: OpeningType) => Promise.resolve(ot),
      updateOpeningType: (ot: OpeningType) => Promise.reject(ot),
      deleteOpeningType: (id: string) => Promise.resolve()
    };
    req = mockRequest();
    req.scope.cradle.api = mockApi;
  });

  test('Should get all opening types and render main view', async () => {
    await controller.getAll(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: false,
      openingTypes: mockOpeningTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/openingTypesContent', expectedData);
  });

  test('Should handle failed API calls for all opening types', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.getOpeningTimeTypes = jest.fn().mockRejectedValue(errorResponse);

    await controller.getAll(req, res);

    const expectedData = {
      errors: [{ text: controller.getOpeningsError }],
      updated: false,
      openingTypes: [] as any,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/openingTypesContent', expectedData);
  });

  test('Should get opening type and render edit view', async () => {
    req.params = { id: mockOpeningTypes[0].id };

    await controller.getOpeningType(req, res);

    const expectedData = {
      openingType: mockOpeningTypes[0],
      updated: false,
      errors: Array.of(),
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/editOpeningType', expectedData);
  });

  test('Should handle failed API calls for a opening type', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.getOpeningType = jest.fn().mockRejectedValue(errorResponse);

    req.params = { id: mockOpeningTypes[0].id };

    await controller.getOpeningType(req, res);

    const expectedData = {
      openingType: null as any,
      updated: false,
      errors: [{ text: controller.getOpeningsError }],
      nameValid: true,
      fatalError: true
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/editOpeningType', expectedData);
  });

  test('Should render add new opening type view', async () => {
    req.params = { id: null };
    await controller.getOpeningType(req, res);

    const expectedData = {
      openingType: null as any,
      updated: false,
      errors: Array.of(),
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/editOpeningType', expectedData);
  });

  test('Should send POST request to API for valid new opening type', async () => {
    req.body = {
      'openingType': mockOpeningTypes[1], //has id
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.updateOpeningType).toBeCalled;
  });

  test('Should send PUT request to API for valid edited opening type', async () => {
    const ot = mockOpeningTypes[0];
    ot.id = null;
    req.body = {
      'openingType': ot, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.createOpeningType).toBeCalled;
  });

  test('Should validate name exists for new opening type', async () => {
    const ot = mockOpeningTypes[0];
    ot.id = null;
    ot.type = '';
    req.body = {
      'openingType': ot, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      openingType: ot,
      updated: false,
      errors: [{ text: controller.nameRequiredError }],
      nameValid: false,
      fatalError: false
    };

    expect(mockApi.createOpeningType).not.toBeCalled;
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/editOpeningType', expectedData);
  });

  test('Should handle 409 Conflict response from API when saving opening type', async () => {
    const ot = mockOpeningTypes[0];
    ot.id = null;
    req.body = {
      'openingType': ot, // no id - create expected
      '_csrf': CSRF.create()
    };

    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // returned by API when name duplicated
    req.scope.cradle.api.createOpeningType= jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedData = {
      openingType: ot,
      updated: false,
      errors: [{ text: controller.nameDuplicatedError }],
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/editOpeningType', expectedData);
  });


  test('Put should not post opening type if csrf token invalid', async () => {
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    const ot = mockOpeningTypes[0];
    ot.id = null;
    req.body = {
      'openingType': ot,
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      openingType: ot,
      updated: false,
      errors: [{ text: controller.updateOpeningError }],
      nameValid: true,
      fatalError: false
    };

    expect(mockApi.createOpeningType).not.toBeCalled;
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/editOpeningType', expectedData);
  });


  test('Should render delete confirmation view', async () => {
    const id = 1234;
    const name = 'Test';
    req.params = { id: id };
    req.query.type = name;

    await controller.getDeleteConfirmation(req, res);

    const expectedData = {
      name: name,
      deleteUrl: `${controller.deleteBaseUrl}${id}`
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/deleteOpeningTypeConfirm', expectedData);
  });

  test('Delete should send delete request to API and render updated view', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: true,
      openingTypes: mockOpeningTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl
    };
    expect(mockApi.deleteOpeningType).toBeCalled;
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/openingTypesContent', expectedData);
  });

  test('Delete should handle 409 Conflict response fromm API', async () => {
    req.params = { id: 200 };
    await controller.delete(req, res);

    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // returned by API when there is a FK constraint violation
    req.scope.cradle.api.deleteOpeningType = jest.fn().mockRejectedValue(errorResponse);

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.openingTypeInUseError }],
      updated: false,
      openingTypes: mockOpeningTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/openingTypesContent', expectedData);
  });

  test('Delete should handle failed API calls', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const errorResponse = mockResponse();
    errorResponse.response.status = 404;
    req.scope.cradle.api.deleteOpeningType = jest.fn().mockRejectedValue(errorResponse);

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.deleteOpeningTypeError }],
      updated: false,
      openingTypes: mockOpeningTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/openingTypes/openingTypesContent', expectedData);
  });

  test('Sanitize converts empty string and whitespace only values to null', async () => {
    let before = {
      id: 300,
      type: '',
      'type_cy': '   '
    };
    let after = controller.sanitizeOpeningType(before);

    expect(after.type).toBeNull();
    expect(after.type_cy).toBeNull();

    before = {
      id: 300,
      type: null,
      'type_cy': null
    };
    after = controller.sanitizeOpeningType(before);

    expect(after.type).toBeNull();
    expect(after.type_cy).toBeNull();
  });


});
