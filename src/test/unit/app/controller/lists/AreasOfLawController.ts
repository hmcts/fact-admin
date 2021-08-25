import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {AreasOfLawController} from '../../../../../main/app/controller/lists/AreasOfLawController';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';

describe ( 'AreasOfLawController', () => {
  let mockApi: {
    getAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getAreaOfLaw: (id: string) => Promise<AreaOfLaw>,
    updateAreaOfLaw: (aol: AreaOfLaw) => Promise<AreaOfLaw>,
    createAreaOfLaw: (aol: AreaOfLaw) => Promise<AreaOfLaw>,
    deleteAreaOfLaw: (id: string) => Promise<void>
  };

  let mockAreasOfLaw: AreaOfLaw[] = [];
  let req: any;
  const res = mockResponse();
  const controller = new AreasOfLawController();
  CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
  CSRF.verify = jest.fn().mockReturnValue(true);

  beforeEach(() => {
    mockAreasOfLaw = [
      {
        id: 100,
        name: 'Divorce',
        'alt_name': '',
        'alt_name_cy': '',
        'external_link': 'https://www.gov.uk/divorce',
        'external_link_desc': 'Information about getting a divorce',
        'external_link_desc_cy': 'Gwybodaeth ynglŷn â gwneud cais am ysgariad',
        'display_name': 'Divorce hearings',
        'display_name_cy': 'Gwrandawiadau ysgariad',
        'display_external_link': 'https://www.gov.uk/divorce'
      },
      {
        id: 200,
        name: 'Tax',
        'alt_name': 'Tax aol',
        'alt_name_cy': 'Tax aol cy',
        'external_link': 'https://www.gov.uk/tax-tribunal',
        'external_link_desc': 'Information about tax tribunal',
        'external_link_desc_cy': 'Gwybodaeth am tribiwnlysoedd treth',
        'display_name': '',
        'display_name_cy': 'Treth',
        'display_external_link': 'https://www.gov.uk/tax-tribunal'
      },
      {
        id: 300,
        name: 'Probate',
        'alt_name': '',
        'alt_name_cy': '',
        'external_link': 'https://www.gov.uk/wills-probate-inheritance',
        'external_link_desc': '',
        'external_link_desc_cy': '',
        'display_name': '',
        'display_name_cy': '',
        'display_external_link': 'https://www.gov.uk/applying-for-probate'
      }
    ];

    mockApi = {
      getAreaOfLaw: (id: string) => Promise.resolve(mockAreasOfLaw.filter(aol => aol.id.toString() === id.toString())[0]),
      getAreasOfLaw: () => Promise.resolve(mockAreasOfLaw),
      createAreaOfLaw: (aol: AreaOfLaw) => Promise.resolve(aol),
      updateAreaOfLaw: (aol: AreaOfLaw) => Promise.reject(aol),
      deleteAreaOfLaw: (id: string) => Promise.resolve()
    };
    req = mockRequest();
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.createAreaOfLaw = jest.fn().mockResolvedValue(res);
    req.scope.cradle.api.updateAreaOfLaw = jest.fn().mockResolvedValue(res);
    req.scope.cradle.api.deleteAreaOfLaw = jest.fn().mockResolvedValue(res);
  });

  test('Should get all areas of law and render summary view', async () => {
    await controller.getAll(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: false,
      areasOfLaw: mockAreasOfLaw.sort((a,b) => a.name.localeCompare(b.name)),
      editUrl: controller.editAreaOfLawUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/areasOfLawContent', expectedData);
  });

  test('Should get area of law and render edit view', async () => {
    req.params = { id: mockAreasOfLaw[0].id };

    await controller.getAreaOfLaw(req, res);

    const expectedData = {
      areaOfLaw: mockAreasOfLaw[0],
      updated: false,
      errors: Array.of(),
      nameValid: true,
      linkValid: true,
      displayLinkValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Should render add new area of law view', async () => {
    req.params = { id: null }; // no id - 'add new' view expected
    await controller.getAreaOfLaw(req, res);

    const expectedData = {
      areaOfLaw: null as any,
      updated: false,
      errors: Array.of(),
      nameValid: true,
      linkValid: true,
      displayLinkValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Put should send POST request to API for valid new area of law', async () => {
    req.body = {
      'areaOfLaw': mockAreasOfLaw[1], // has id - update expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.updateAreaOfLaw).toBeCalled();
  });

  test('Put should send PUT request to API for valid edited area of law', async () => {
    const aol = mockAreasOfLaw[0];
    aol.id = null;
    req.body = {
      'areaOfLaw': aol, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    expect(mockApi.createAreaOfLaw).toBeCalled();
  });

  test('Put should validate name exists for new areas of law', async () => {
    const aol = mockAreasOfLaw[0];
    aol.id = null;
    aol.name = '';
    req.body = {
      'areaOfLaw': aol, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      areaOfLaw: aol,
      updated: false,
      errors: [{ text: controller.nameRequiredError }],
      nameValid: false,
      linkValid: true,
      displayLinkValid: true,
      fatalError: false
    };

    expect(mockApi.createAreaOfLaw).not.toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Put should validate external link URL', async () => {
    const aol = mockAreasOfLaw[0];
    aol.id = null;
    aol['external_link'] = 'ht:tp//this.isnot.valid';
    req.body = {
      'areaOfLaw': aol, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      areaOfLaw: aol,
      updated: false,
      errors: [{ text: controller.externalLinkInvalidError }],
      nameValid: true,
      linkValid: false,
      displayLinkValid: true,
      fatalError: false
    };

    expect(mockApi.createAreaOfLaw).not.toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Put should validate display external link URL', async () => {
    const aol = mockAreasOfLaw[0];
    aol.id = null;
    aol['display_external_link'] = 'ht:tp//this.isnot.valid';
    req.body = {
      'areaOfLaw': aol, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      areaOfLaw: aol,
      updated: false,
      errors: [{ text: controller.dispExternalLinkInvalidError }],
      nameValid: true,
      linkValid: true,
      displayLinkValid: false,
      fatalError: false
    };

    expect(mockApi.createAreaOfLaw).not.toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Put should handle 409 Conflict response from API when saving areas of law', async () => {
    const aol = mockAreasOfLaw[0];
    aol.id = null;
    req.body = {
      'areaOfLaw': aol, // no id - create expected
      '_csrf': CSRF.create()
    };

    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // returned by API when name duplicated
    req.scope.cradle.api.createAreaOfLaw = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedData = {
      areaOfLaw: aol,
      updated: false,
      errors: [{ text: controller.areaOfLawAlreadyExistsError }],
      nameValid: true,
      linkValid: true,
      displayLinkValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Put should handle failed API calls for saving areas of law', async () => {
    const aol = mockAreasOfLaw[0];
    aol.id = null;
    req.body = {
      'areaOfLaw': aol, // no id - create expected
      '_csrf': CSRF.create()
    };

    const errorResponse = mockResponse();
    errorResponse.response.status = 404;
    req.scope.cradle.api.createAreaOfLaw = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedData = {
      areaOfLaw: aol,
      updated: false,
      errors: [{ text: controller.updateAreaOfLawError }],
      nameValid: true,
      linkValid: true,
      displayLinkValid: true,
      fatalError: false
    };
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Put should not post area of law if csrf token invalid', async () => {
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    const aol = mockAreasOfLaw[0];
    aol.id = null;
    req.body = {
      'areaOfLaw': aol, // no id - create expected
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    const expectedData = {
      areaOfLaw: aol,
      updated: false,
      errors: [{ text: controller.updateAreaOfLawError }],
      nameValid: true,
      linkValid: true,
      displayLinkValid: true,
      fatalError: false
    };

    expect(mockApi.createAreaOfLaw).not.toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Delete should send delete request to API and render updated view', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const expectedData = {
      errors: Array.of(),
      updated: true,
      areasOfLaw: mockAreasOfLaw.sort((a,b) => a.name.localeCompare(b.name)),
      editUrl: controller.editAreaOfLawUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(mockApi.deleteAreaOfLaw).toBeCalled();
    expect(res.render).toBeCalledWith('lists/tabs/areasOfLawContent', expectedData);
  });

  test('Delete should handle 409 Conflict response fromm API', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const errorResponse = mockResponse();
    errorResponse.response.status = 409; // returned by API when there is a FK constraint violation
    req.scope.cradle.api.deleteAreaOfLaw = jest.fn().mockRejectedValue(errorResponse);

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.areaOfLawInUseError }],
      updated: false,
      areasOfLaw: mockAreasOfLaw.sort((a,b) => a.name.localeCompare(b.name)),
      editUrl: controller.editAreaOfLawUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/areasOfLawContent', expectedData);
  });

  test('Delete should handle failed API calls', async () => {
    req.params = { id: 100 };
    await controller.delete(req, res);

    const errorResponse = mockResponse();
    errorResponse.response.status = 404;
    req.scope.cradle.api.deleteAreaOfLaw = jest.fn().mockRejectedValue(errorResponse);

    await controller.delete(req, res);

    const expectedData = {
      errors: [{ text: controller.deleteError }],
      updated: false,
      areasOfLaw: mockAreasOfLaw.sort((a,b) => a.name.localeCompare(b.name)),
      editUrl: controller.editAreaOfLawUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/areasOfLawContent', expectedData);
  });

  test('Should handle failed API calls for all areas of law', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.getAreasOfLaw = jest.fn().mockRejectedValue(errorResponse);

    await controller.getAll(req, res);

    const expectedData = {
      errors: [{ text: controller.getAreasOfLawError }],
      updated: false,
      areasOfLaw: [] as any,
      editUrl: controller.editAreaOfLawUrl,
      deleteUrl: controller.deleteConfirmUrl
    };
    expect(res.render).toBeCalledWith('lists/tabs/areasOfLawContent', expectedData);
  });

  test('Should handle failed API calls for single areas of law', async () => {
    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.getAreaOfLaw = jest.fn().mockRejectedValue(errorResponse);

    req.params = { id: mockAreasOfLaw[0].id };

    await controller.getAreaOfLaw(req, res);

    const expectedData = {
      areaOfLaw: null as any,
      updated: false,
      errors: [{ text: controller.getAreaOfLawError }],
      nameValid: true,
      linkValid: true,
      displayLinkValid: true,
      fatalError: true
    };
    expect(res.render).toBeCalledWith('lists/tabs/editAreaOfLaw', expectedData);
  });

  test('Sanitize converts empty string and whitespace only values to null', async () => {
    let before = {
      id: 300,
      name: 'Probate',
      'alt_name': '',
      'alt_name_cy': '  ',
      'external_link': '',
      'external_link_desc': '',
      'external_link_desc_cy': '     ',
      'display_name': '',
      'display_name_cy': '',
      'display_external_link': ' '
    };
    let after = controller.sanitizeAreaOfLaw(before);

    expect(after.alt_name).toBeNull();
    expect(after.alt_name_cy).toBeNull();
    expect(after.external_link).toBeNull();
    expect(after.external_link_desc).toBeNull();
    expect(after.external_link_desc_cy).toBeNull();
    expect(after.display_name).toBeNull();
    expect(after.display_name_cy).toBeNull();
    expect(after.display_external_link).toBeNull();

    before = {
      id: 300,
      name: 'Probate',
      'alt_name': null,
      'alt_name_cy': null,
      'external_link': null,
      'external_link_desc': null,
      'external_link_desc_cy': null,
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null
    };
    after = controller.sanitizeAreaOfLaw(before);

    expect(after.alt_name).toBeNull();
    expect(after.alt_name_cy).toBeNull();
    expect(after.external_link).toBeNull();
    expect(after.external_link_desc).toBeNull();
    expect(after.external_link_desc_cy).toBeNull();
    expect(after.display_name).toBeNull();
    expect(after.display_name_cy).toBeNull();
    expect(after.display_external_link).toBeNull();
  });
});
