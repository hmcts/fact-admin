import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {FacilityType} from '../../../../../main/types/Facility';
import {FacilityTypesController} from '../../../../../main/app/controller/lists/FacilityTypesController';

describe('FacilitiesTypeController', () => {

  let mockApi: {
    getFacilityTypes: () => Promise<FacilityType[]>,
    getFacilityType: (id: string) => Promise<FacilityType>,
    createFacilityType: (f: FacilityType) => Promise<FacilityType>,
    updateFacilityType: (f: FacilityType) => Promise<FacilityType>,
    deleteFacilityType: (id: string) => Promise<number>,
    reorderFacilityTypes: (ids: string[]) => Promise<FacilityType[]>
  };

  let facilityTypes: FacilityType[];
  let req: any;
  const res = mockResponse();
  const controller = new FacilityTypesController();

  beforeEach(() => {
    facilityTypes = [
      { id: 100, name: 'Facility Type 1', nameCy: 'Facility Type 1 cy', order: 1 },
      { id: 200, name: 'Facility Type 2', nameCy: 'Facility Type 2 cy', order: 2 },
      { id: 300, name: 'Facility Type 3', nameCy: 'Facility Type 3 cy', order: 3 },
    ];

    mockApi = {
      getFacilityTypes: () => Promise.resolve(facilityTypes),
      getFacilityType: (id: string) => Promise.resolve(facilityTypes.filter(ft => ft.id.toString() == id)[0]),
      createFacilityType: (ft: FacilityType) => Promise.resolve(ft),
      updateFacilityType: (ft: FacilityType) => Promise.resolve(ft),
      deleteFacilityType: (id: string) => Promise.resolve(parseInt(id)),
      reorderFacilityTypes: (ids: string[]) => Promise.resolve(ids.map(id => facilityTypes.filter(ft => ft.id.toString() == id)[0]))
    };
    req = mockRequest();
    req.scope.cradle.api = mockApi;

    req.scope.cradle.api.createFacilityType = jest.fn().mockResolvedValue(res);
    req.scope.cradle.api.updateFacilityType = jest.fn().mockResolvedValue(res);
    req.scope.cradle.api.deleteFacilityType = jest.fn().mockResolvedValue(res);
    req.scope.cradle.api.reorderFacilityTypes = jest.fn().mockResolvedValue(res);

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get all facility types and render summary view', async () => {
    await controller.getAll(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: false,
      facilityTypes: facilityTypes,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: true
    };
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });

  test('Should get all facility types and render reorder view', async () => {
    await controller.getAllReorder(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: false,
      facilityTypes: facilityTypes,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });

  test('Get all facility types should handle failed API calls', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500;
    req.scope.cradle.api.getFacilityTypes = jest.fn().mockRejectedValue(errorResponse);

    const expectedData = {
      errors: [{ text: controller.getFacilitiesError }],
      updated: false,
      facilityTypes: [] as any,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: true
    };

    await controller.getAll(req, res);
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);

    await controller.getAllReorder(req, res);
    expectedData.editMode = false;
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });

  test('Should get facility type and render edit view', async () => {
    req.params = { id: facilityTypes[1].id };
    await controller.getFacilityType(req, res);

    const expectedData = {
      facilityType: facilityTypes[1],
      updated: false,
      errors: Array.of(),
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
  });

  test('Get facility type should handle failed API calls', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500;
    req.params = { id: 100 };
    req.scope.cradle.api.getFacilityType = jest.fn().mockRejectedValue(errorResponse);

    await controller.getFacilityType(req, res);

    const expectedData = {
      facilityType: null as any,
      updated: false,
      errors: [{ text: controller.getFacilityError }],
      nameValid: true,
      fatalError: true
    };
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
  });

  test('Should render add new facility type view', async () => {
    await controller.getFacilityType(req, res); // no id set in req.params

    const expectedData = {
      facilityType: null as any,
      updated: false,
      errors: Array.of(),
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
  });

  test('Should render delete confirmation view', async () => {
    const id = 250;
    const name = 'Parking';
    req.params = { id: id };
    req.query.name = name;

    await controller.getDeleteConfirmation(req, res);

    const expectedData = {
      name: name,
      deleteUrl: `${controller.deleteBaseUrl}${id}`
    };
    expect(res.render).toBeCalledWith('lists/tabs/deleteFacilityTypeConfirm', expectedData);
  });

  test('Put should send POST request to API for valid new facility type', async () => {
    const newFacilityType = facilityTypes[1];
    newFacilityType.id = null;

    req.body = {
      facilityType: newFacilityType, // no id - create expected
      _csrf: CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.createFacilityType).toBeCalled();
  });

  test('Put should send PUT request to API for valid updated facility type', async () => {
    req.body = {
      facilityType: facilityTypes[1], // has id - update expected
      _csrf: CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.updateFacilityType).toBeCalled();
  });

  test('Put should validate a name is provided for a facility type', async () => {
    const facilityTypeNoName = facilityTypes[1];
    facilityTypeNoName.name = '';

    req.body = {
      facilityType: facilityTypeNoName,
      _csrf: CSRF.create()
    };

    const expectedData = {
      facilityType: facilityTypeNoName,
      updated: false,
      errors: [{ text: controller.nameRequiredError }],
      nameValid: false,
      fatalError: false
    };

    /// Test Case 1: Update (facility type has id)
    await controller.put(req, res);
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
    expect(mockApi.createFacilityType).not.toBeCalled();

    // Test Case 2: Create (facility type has no id)
    facilityTypeNoName.id = null;
    await controller.put(req, res);
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
    expect(mockApi.createFacilityType).not.toBeCalled();
  });

  test('Put should handle a 409 Conflict response from the API', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // An existing facility type has the same name as proposed
    req.scope.cradle.api.createFacilityType = jest.fn().mockRejectedValue(errorResponse);
    req.scope.cradle.api.updateFacilityType = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      facilityType: facilityTypes[1], // has id - update expected
      _csrf: CSRF.create()
    };

    const expectedData = {
      facilityType: req.body.facilityType,
      updated: false,
      errors: [{ text: controller.nameDuplicatedError }],
      nameValid: true,
      fatalError: false
    };

    // Test Case 1: facility type has id - update
    await controller.put(req, res);
    expect(req.scope.cradle.api.updateFacilityType).toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);

    // Test Case 2: facility type has no id - create new
    req.body.facilityType.id = null;
    await controller.put(req, res);
    expect(req.scope.cradle.api.createFacilityType).toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
  });

  test('Put should handle failed API calls when saving facility types', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500;
    req.scope.cradle.api.createFacilityType = jest.fn().mockRejectedValue(errorResponse);
    req.scope.cradle.api.updateFacilityType = jest.fn().mockRejectedValue(errorResponse);

    req.body = {
      facilityType: facilityTypes[1], // has id - update expected
      _csrf: CSRF.create()
    };

    const expectedData = {
      facilityType: req.body.facilityType,
      updated: false,
      errors: [{ text: controller.updateFacilityError }],
      nameValid: true,
      fatalError: false
    };

    // Test Case 1: facility type has id - update
    await controller.put(req, res);
    expect(req.scope.cradle.api.updateFacilityType).toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);

    // Test Case 2: facility type has no id - create new
    req.body.facilityType.id = null;
    await controller.put(req, res);
    expect(req.scope.cradle.api.createFacilityType).toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
  });

  test('Put should not post data to API if csrf token invalid', async () => {
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    req.body = {
      'facilityType': facilityTypes[0],
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      facilityType: req.body.facilityType,
      updated: false,
      errors: [{ text: controller.updateFacilityError }],
      nameValid: true,
      fatalError: false
    };

    expect(mockApi.updateFacilityType).not.toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editFacilityType', expectedData);
  });

  test('Delete should send delete request to API', async () => {
    req.params = { id: 100};
    req.body = {
      _csrf: CSRF.create()
    };
    await controller.delete(req, res);

    expect(mockApi.deleteFacilityType).toBeCalled();
  });

  test('Delete_ should handle 409 Conflict response from API', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // Attempted to delete a facility type in use
    req.scope.cradle.api.deleteFacilityType = jest.fn().mockRejectedValue(errorResponse);
    req.params = { id: 100 };
    req.body = {
      _csrf: CSRF.create()
    };

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.facilityTypeInUseError }],
      updated: false,
      facilityTypes: facilityTypes,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: true
    };

    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });

  test('Delete should handle failed API calls when deleting facility types', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500; // An internal server error
    req.scope.cradle.api.deleteFacilityType = jest.fn().mockRejectedValue(errorResponse);
    req.params = { id: 100 };
    req.body = {
      _csrf: CSRF.create()
    };

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.deleteFacilityTypeError }],
      updated: false,
      facilityTypes: facilityTypes,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: true
    };
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });

  test('Delete should not send delete request to API if csrf token invalid', async () => {
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    req.params = { id: 100};
    req.body = {
      _csrf: CSRF.create()
    };
    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.deleteFacilityTypeError }],
      updated: false,
      facilityTypes: facilityTypes,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: true
    };
    expect(mockApi.deleteFacilityType).not.toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });

  test('Reorder should call API to reorder facility types', async () => {
    const idsInOrder = [100, 300, 200, 400];
    req.body = {
      facilityIds: idsInOrder,
      _csrf: CSRF.create()
    };
    await controller.reorder(req, res);

    expect(mockApi.reorderFacilityTypes).toBeCalledWith(idsInOrder);
  });

  test('Reorder should handle failed API calls when re-ordering facility types', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 500; // An internal server error
    req.scope.cradle.api.reorderFacilityTypes = jest.fn().mockRejectedValue(errorResponse);

    const idsInOrder = [100, 300, 200, 400];
    req.body = {
      facilityIds: idsInOrder,
      _csrf: CSRF.create()
    };
    await controller.reorder(req, res);

    const expectedData = {
      errors: [{ text: controller.reorderError }],
      updated: false,
      facilityTypes: facilityTypes,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });

  test('Reorder should not send request to API if csrf token invalid', async () => {
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    const idsInOrder = [100, 300, 200, 400];
    req.body = {
      facilityIds: idsInOrder,
      _csrf: CSRF.create()
    };
    await controller.reorder(req, res);

    const expectedData = {
      errors: [{ text: controller.reorderError }],
      updated: false,
      facilityTypes: facilityTypes,
      editBaseUrl: controller.editBaseUrl,
      deleteConfirmBaseUrl: controller.deleteConfirmBaseUrl,
      editMode: false
    };
    expect(mockApi.reorderFacilityTypes).not.toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/facilityTypesContent', expectedData);
  });
});
