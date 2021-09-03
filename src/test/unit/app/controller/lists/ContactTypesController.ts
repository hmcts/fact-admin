import {ContactType} from "../../../../../main/types/ContactType";
import {mockResponse} from "../../../utils/mockResponse";
import {CSRF} from "../../../../../main/modules/csrf";
import {ContactTypesController} from "../../../../../main/app/controller/lists/ContactTypesController";
import {mockRequest} from "../../../utils/mockRequest";

describe ( 'ContactTypesController', () => {
  let mockApi: {
    getContactTypes: () => Promise<ContactType[]>,
    getContactType: (id: string) => Promise<ContactType>,
    updateContactType: (ct: ContactType) => Promise<ContactType>,
    createContactType: (ct: ContactType) => Promise<ContactType>,
    deleteContactType: (id: string) => Promise<void>
  };

  let mockContactTypes: ContactType[] = [];
  let req: any;
  const res = mockResponse();
  const controller = new ContactTypesController();
  CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
  CSRF.verify = jest.fn().mockReturnValue(true);


  beforeEach(() => {
    mockContactTypes = [
      {
        id: 100,
        type: 'Admin',
        type_cy:''
      },
      {
        id: 200,
        type: 'Adoption',
        type_cy:''
      },
      {
        id: 300,
        type: 'Appeals',
        type_cy:''
      }
    ];

    mockApi = {
      getContactType: (id: string) => Promise.resolve(mockContactTypes.filter(ct => ct.id.toString() === id.toString())[0]),
      getContactTypes: () => Promise.resolve(mockContactTypes),
      createContactType: (ct: ContactType) => Promise.resolve(ct),
      updateContactType: (ct: ContactType) => Promise.reject(ct),
      deleteContactType: (id: string) => Promise.resolve()
    };
    req = mockRequest();
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.createAreaOfLaw = jest.fn().mockResolvedValue(res);
    req.scope.cradle.api.updateAreaOfLaw = jest.fn().mockResolvedValue(res);
    req.scope.cradle.api.deleteAreaOfLaw = jest.fn().mockResolvedValue(res);
  });

  test('Should get all contact types and render main view', async () => {
    await controller.getAll(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: false,
      contactTypes: mockContactTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editUrl: controller.editContactTypeUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/contactTypeContent', expectedData);
  });

  test('Should handle failed API calls for all contact types', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.getContactTypes = jest.fn().mockRejectedValue(errorResponse);

    await controller.getAll(req, res);

    const expectedData = {
      errors: [{ text: controller.getContactTypesError }],
      updated: false,
      contactTypes: [] as any,
      editUrl: controller.editContactTypeUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/contactTypeContent', expectedData);
  });

  test('Should get contact type and render edit view', async () => {
    req.params = { id: mockContactTypes[0].id };

    await controller.getContactType(req, res);

    const expectedData = {
      contactType: mockContactTypes[0],
      updated: false,
      errors: Array.of(),
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/editContactType', expectedData);
  });

  test('Should handle failed API calls for a contact type', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.getContactType = jest.fn().mockRejectedValue(errorResponse);

    req.params = { id: mockContactTypes[0].id };

    await controller.getContactType(req, res);

    const expectedData = {
      contactType: null as any,
      updated: false,
      errors: [{ text: controller.getContactTypeError }],
      nameValid: true,
      fatalError: true
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/editContactType', expectedData);
  });

  test('Should render add new contact type view', async () => {
    req.params = { id: null };
    await controller.getContactType(req, res);

    const expectedData = {
      contactType: null as any,
      updated: false,
      errors: Array.of(),
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/editContactType', expectedData);
  });

  test('Should send POST request to API for valid new contact type', async () => {
    req.body = {
      'contactType': mockContactTypes[1], //has id
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.updateContactType).toBeCalled;
  });

  test('Should send PUT request to API for valid edited contact type', async () => {
    const ct = mockContactTypes[0];
    ct.id = null;
    req.body = {
      'contactType': ct, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.createContactType).toBeCalled;
  });

  test('Should validate name exists for new contact type', async () => {
    const ct = mockContactTypes[0];
    ct.id = null;
    ct.type = '';
    req.body = {
      'contactType': ct, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      contactType: ct,
      updated: false,
      errors: [{ text: controller.nameRequiredError }],
      nameValid: false,
      fatalError: false
    };

    expect(mockApi.createContactType).not.toBeCalled;
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/editContactType', expectedData);
  });

  test('Should handle 409 Conflict response from API when saving contact type', async () => {
    const ct = mockContactTypes[0];
    ct.id = null;
    req.body = {
      'contactType': ct, // no id - create expected
      '_csrf': CSRF.create()
    };

    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // returned by API when name duplicated
    req.scope.cradle.api.createContactType = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedData = {
      contactType: ct,
      updated: false,
      errors: [{ text: controller.contactTypeAlreadyExistsError }],
      nameValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/editContactType', expectedData);
  });


  test('Put should not post contact type if csrf token invalid', async () => {
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    const ct = mockContactTypes[0];
    ct.id = null;
    req.body = {
      'contactType': ct,
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      contactType: ct,
      updated: false,
      errors: [{ text: controller.updateContactTypeError }],
      nameValid: true,
      fatalError: false
    };

    expect(mockApi.createContactType).not.toBeCalled;
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/editContactType', expectedData);
  });
  test('Should render delete confirmation view', async () => {
    const id = 1234;
    const name = 'Adoption';
    req.params = { id: id };
    req.query.type = name;

    await controller.getDeleteConfirmation(req, res);

    const expectedData = {
      name: name,
      deleteUrl: `${controller.deleteContactTypeUrl}${id}`
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/deleteContactTypeConfirm', expectedData);
  });

  test('Delete should send delete request to API and render updated view', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: true,
      contactTypes: mockContactTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editUrl: controller.editContactTypeUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(mockApi.deleteContactType).toBeCalled;
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/contactTypeContent', expectedData);
  });

  test('Delete should handle 409 Conflict response fromm API', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // returned by API when there is a FK constraint violation
    req.scope.cradle.api.deleteContactType = jest.fn().mockRejectedValue(errorResponse);

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.contactTypeInUseError }],
      updated: false,
      contactTypes: mockContactTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editUrl: controller.editContactTypeUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/contactTypeContent', expectedData);
  });

  test('Delete should handle failed API calls', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const errorResponse = mockResponse();
    errorResponse.response.status = 404;
    req.scope.cradle.api.deleteContactType = jest.fn().mockRejectedValue(errorResponse);

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.deleteError }],
      updated: false,
      contactTypes: mockContactTypes.sort((a,b) => a.type.localeCompare(b.type)),
      editUrl: controller.editContactTypeUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/contactTypes/contactTypeContent', expectedData);
  });

  test('Sanitize converts empty string and whitespace only values to null', async () => {
    let before = {
      id: 300,
      type: '',
      type_cy: '   '
    };
    let after = controller.sanitizeContactType(before);

    expect(after.type).toBeNull();
    expect(after.type_cy).toBeNull();

    before = {
      id: 300,
      type: null,
      type_cy: null
    };
    after = controller.sanitizeContactType(before);

    expect(after.type).toBeNull();
    expect(after.type_cy).toBeNull();
  });


});
