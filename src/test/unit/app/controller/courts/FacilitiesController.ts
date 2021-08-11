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
    { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1', isNew: false },
    { name:'Facility2', description:'description2',descriptionCy:'descriptionCy2', isNew: false},
    { name:'Facility3', description:'description3',descriptionCy:'descriptionCy3', isNew: false}
  ];

  const facilityTypes: FacilityType[] = [
    { id: 1, name:'Facility1'},
    { id: 2, name:'Facility2'},
    { id: 3, name:'Facility3'}
  ];

  const expectedSelectItems: SelectItem[] = [
    { value: 'Facility1',
      text: 'Facility1',
      selected: false },
    { value: 'Facility2',
      text: 'Facility2',
      selected: false },
    { value: 'Facility3',
      text: 'Facility3',
      selected: false },
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
    const expectedCourtFacilities = getFacilities().concat([{ name: null, description: null, descriptionCy: null, isNew: true }]);

    const expectedResults: FacilityPageData = {
      errors: [],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: expectedCourtFacilities
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

  test('Should not post facilities if description or name is empty', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1' },
      { name:'Facility2', description:'', descriptionCy:'descriptionCy2'}
    ];

    req.body = {
      'courtFacilities': postedFacilities,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtFacilities = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if opening times data is incomplete
    expect(mockApi.updateCourtFacilities).not.toBeCalled();
  });

  test('Should not post facilities if a facility is duplicated', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1' },
      { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1'}
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

  test('Should not post facilities if CSRF token is invalid', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1' },
      { name:'Facility2', description:'description2',descriptionCy:'descriptionCy2'}
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
      courtFacilities: postedFacilities
    };

    await controller.put(req, res);

    // Should not call API if opening times data is incomplete
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
      courtFacilities: null
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

    const expectedCourtFacilities = getFacilities().concat([{ name: null, description: null, descriptionCy: null, isNew: true }]);

    const expectedResults: FacilityPageData = {
      errors: [{text: controller.getFacilityTypesErrorMsg}],
      updated: false,
      facilitiesTypes: [],
      courtFacilities: expectedCourtFacilities
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should handle error with duplicated facilities when updating court facilities', async () => {
    const req = mockRequest();
    const postedFacilities = getFacilities().concat([{ name:'Facility1', description:'description1',descriptionCy:'descriptionCy1', isNew: true }]);
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
      courtFacilities: postedFacilities
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });


  test('Should handle error with empty name and description when updating court facilities', async () => {
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1' },
      { name:'', description:'test', descriptionCy:'descriptionCy2'},
      { name: null, description: null, descriptionCy: null, isNew: true }
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

    const expectedResults: FacilityPageData = {
      errors: [{text: controller.emptyNameOrDescriptionErrorMsg}],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: postedFacilities
    };
    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });

  test('Should handle multiple errors when updating court facilities', async () => {
    const req = mockRequest();
    const postedFacilities: Facility[] = [
      { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1' },
      { name:'Facility1', description:'description1',descriptionCy:'descriptionCy1' },
      { name:'', description:'test', descriptionCy:'descriptionCy2'},
      { name: null, description: null, descriptionCy: null, isNew: true }
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

    const expectedResults: FacilityPageData = {
      errors: [
        {text: controller.emptyNameOrDescriptionErrorMsg},
        {text: controller.facilityDuplicatedErrorMsg}
      ],
      updated: false,
      facilitiesTypes: expectedSelectItems,
      courtFacilities: postedFacilities
    };

    expect(res.render).toBeCalledWith('courts/tabs/facilitiesContent', expectedResults);
  });
});
