import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CourtFacilitiesController} from '../../../../../main/app/controller/courts/CourtFacilitiesController';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CSRF} from '../../../../../main/modules/csrf';
import {Facility, FacilityPageData, FacilityType} from '../../../../../main/types/Facility';

describe('FacilitiesController', () => {

  let mockApi: {
    getAllFacilityTypes: () => Promise<FacilityType[]>,
    getCourtFacilities: () => Promise<Facility[]>,
    updateCourtFacilities: () => Promise<Facility[]> };

  const getFacilities: () => Facility[] = () => [
    { id: 1,name:'Facility1', description:'description1', descriptionCy:'descriptionCy1', isNew: false },
    { id: 2,name:'Facility2', description:'description2', descriptionCy:'descriptionCy2', isNew: false },
    { id: 3,name:'Facility3', description:'description3', descriptionCy:'descriptionCy3', isNew: false }
  ];
  const newfacilityRow: Facility[] = [{ id: null,name: null, description: null, descriptionCy: null, isNew: true }];

  const facilityTypes: FacilityType[] = [
    { id: 1, name:'Facility1' },
    { id: 2, name:'Facility2' },
    { id: 3, name:'Facility3' }
  ];

  const expectedSelectItems: SelectItem[] = [
    {
      value: 1,
      text: 'Facility1',
      selected: false
    },
    {
      value: 2,
      text: 'Facility2',
      selected: false
    },
    {
      value: 3,
      text: 'Facility3',
      selected: false
    },
  ];

  const controller = new CourtFacilitiesController();

  beforeEach(() => {
    mockApi = {
      getCourtFacilities: async (): Promise<Facility[]> => getFacilities(),
      updateCourtFacilities: async (): Promise<Facility[]> => getFacilities(),
      getAllFacilityTypes: async (): Promise<FacilityType[]> => facilityTypes
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get facilities view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    // Empty entry expected for adding new court facility
    const expectedCourtFacilities = getFacilities().concat(newfacilityRow);

    const expectedResults: FacilityPageData = {
      errors: [],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: expectedCourtFacilities,
      requiresValidation: true
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should post court facilities if facilities are valid', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'courtFacilities': getFacilities(),
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockResolvedValue(getFacilities());

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtFacilities).toBeCalledWith(slug, getFacilities());
  });

  test('Should not post facilities if description is empty', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { id: 1,name: 'Facility1', description: 'description1', descriptionCy:'descriptionCy1' },
      {id: 2, name: 'Facility2', description: '', descriptionCy: 'descriptionCy2'}
    ];

    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API for incomplete field
    expect(mockApi.updateCourtFacilities).not.toBeCalled();
  });

  test('Should not post facilities if name is empty', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      {id: 1, name: 'Facility1', description: 'description1', descriptionCy:'descriptionCy1' },
      {id: null,name: '', description: 'description2', descriptionCy: 'descriptionCy2'}
    ];

    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API for incomplete field
    expect(mockApi.updateCourtFacilities).not.toBeCalled();
  });

  test('Should not post facilities if the facility name is duplicated', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      {id: 1, name:'Facility1', description:'description1', descriptionCy: 'descriptionCy1' },
      {id: 2, name:'Facility1', description:'description2', descriptionCy: 'descriptionCy2' }
    ];
    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockReturnValue(res);

    await controller.put(req, res);
    expect(mockApi.updateCourtFacilities).not.toBeCalled();
  });

  test('Should not post facilities if multiple facility names of the same type', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      {id: 1, name:'Parking', description:'description1', descriptionCy: 'descriptionCy1' },
      {id: 2, name:'No parking', description:'description2', descriptionCy: 'descriptionCy2' }
    ];
    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockReturnValue(res);

    await controller.put(req, res);
    expect(mockApi.updateCourtFacilities).not.toBeCalled();
  });

  test('Should post court facilities if the facility description is duplicated', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { id: 1,name:'Facility1', description:'description1', descriptionCy: 'descriptionCy1' },
      { id: 2,name:'Facility2', description:'description1', descriptionCy: 'descriptionCy1' }
    ];
    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockResolvedValue(getFacilities());

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtFacilities).toBeCalledWith(slug, postedFacilities);
  });

  test('Should not post facilities if CSRF token is invalid', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { id: 1,name:'Facility1', description:'description1',descriptionCy:'descriptionCy1' },
      { id: 2,name:'Facility2', description:'description2',descriptionCy:'descriptionCy2'}
    ];

    (CSRF.verify as jest.Mock).mockReturnValue(false);

    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockReturnValue(res);

    const expectedResults: FacilityPageData = {
      errors: [{text: controller.updateErrorMsg}],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: postedFacilities,
      requiresValidation: true
    };

    await controller.put(req, res);

    expect(mockApi.updateCourtFacilities).not.toBeCalled();
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should handle errors when getting court facilities data from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtFacilities = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    const expectedResults: FacilityPageData = {
      errors: [{text: controller.getCourtFacilitiesErrorMsg}],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: null,
      requiresValidation: true
    };
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should handle errors when getting facility types from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getAllFacilityTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedCourtFacilities = getFacilities().concat([{id:null, name: null, description: null, descriptionCy: null, isNew: true }]);

    const expectedResults: FacilityPageData = {
      errors: [{text: controller.getFacilityTypesErrorMsg}],
      updated: false,
      facilitiesTypes: [],
      courtFacilities: expectedCourtFacilities,
      requiresValidation: true
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should handle error with duplicated facilities when updating court facilities', async () => {
    const req = mockRequest();
    const postedFacilities = getFacilities().concat([{id:null, name: 'Facility1', description: 'description1',descriptionCy: 'descriptionCy1', isNew: true }]);
    req.params = { slug: 'southport-county-court' };
    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);

    const expectedResults: FacilityPageData = {
      errors: [{text: controller.facilityDuplicatedErrorMsg}],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: postedFacilities,
      requiresValidation: true
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });


  test('Should handle error with empty name and description when updating court facilities', async () => {
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { id: 1,name: 'Facility1', description: 'description1',descriptionCy: 'descriptionCy1' },
      { id: 2,name: '', description: 'test', descriptionCy: 'descriptionCy2' },
      { id: null,name: null, description: null, descriptionCy: null, isNew: true }
    ];
    req.params = { slug: 'southport-county-court' };
    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);

    const expectedFacilities: Facility[] = [
      { id: 1,name: 'Facility1', description: 'description1',descriptionCy: 'descriptionCy1', isNew: false },
      { id: 2,name: '', description: 'test', descriptionCy: 'descriptionCy2', isNew: false },
      { id: null,name: null, description: null, descriptionCy: null, isNew: true }
    ];

    const expectedResults: FacilityPageData = {
      errors: [{text: controller.emptyNameOrDescriptionErrorMsg}],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: expectedFacilities,
      requiresValidation: true
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should handle multiple errors when updating court facilities', async () => {
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { id: 1,name: 'Facility1', description: 'description1', descriptionCy: 'descriptionCy1' },
      { id: 1,name: 'Facility1', description: 'description2', descriptionCy: 'descriptionCy2' },
      { id: 2,name: '', description: 'description2', descriptionCy: 'descriptionCy2' },
      { id: null,name: null, description: null, descriptionCy: null, isNew: true }
    ];
    req.params = { slug: 'southport-county-court' };
    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);

    const expectedFacilities: Facility[] = [
      { id: 1,name: 'Facility1', description: 'description1', descriptionCy: 'descriptionCy1', isDuplicated:true , isNew:false},
      { id: 1,name: 'Facility1', description: 'description2', descriptionCy: 'descriptionCy2', isDuplicated:true, isNew:false },
      { id: 2,name: '', description: 'description2', descriptionCy: 'descriptionCy2' ,isNew: false},
      { id: null,name: null, description: null, descriptionCy: null, isNew: true }
    ];

    const expectedResults: FacilityPageData = {
      errors: [
        {text: controller.emptyNameOrDescriptionErrorMsg},
        {text: controller.facilityDuplicatedErrorMsg}
      ],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: expectedFacilities,
      requiresValidation: true
    };

    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should add new row to facilities view and render the page', async () => {
    const req = mockRequest();

    req.body = {
      'courtFacilities': getFacilities(),
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.addRow(req, res);

    // Empty entry expected for adding new court facility
    const expectedCourtFacilities = getFacilities().concat(newfacilityRow);

    const expectedResults: FacilityPageData = {
      errors: [],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: expectedCourtFacilities,
      requiresValidation: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });
});
