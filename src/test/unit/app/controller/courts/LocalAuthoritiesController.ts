import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';

import {
  LocalAuthoritiesAreaOfLaw,
  LocalAuthoritiesPageData,
  LocalAuthority, LocalAuthorityItem
} from '../../../../../main/types/LocalAuthority';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';
import {LocalAuthoritiesController} from '../../../../../main/app/controller/courts/LocalAuthoritiesController';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CSRF} from '../../../../../main/modules/csrf';
import {CourtTypesAndCodes} from "../../../../../main/types/CourtTypesAndCodes";

describe ( 'LocalAuthoritiesController', () => {

  let mockApi: {
    getCourtAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtTypesAndCodes: () => Promise<CourtTypesAndCodes>,
    getAllLocalAuthorities: () => Promise<LocalAuthority[]>,
    getCourtLocalAuthoritiesByAreaOfLaw: () => Promise<LocalAuthority[]>,
    updateCourtLocalAuthoritiesByAreaOfLaw: () => Promise<LocalAuthority[]> };

  let mockApiAreaOfLaw: {
    getCourtAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtTypesAndCodes: () => Promise<CourtTypesAndCodes>
  };

  const courtAreasOfLaw: AreaOfLaw[] = [
    {
      id: 1,
      name:'Adoption',
      'external_link': 'https://www.gov.uk/child-adoption/applying-for-an-adoption-court-order',
      'external_link_desc': 'Adoption',
      'external_link_desc_cy': 'Adoption',
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null,
      'alt_name': null,
      'alt_name_cy': null
    },
    {
      id: 2,
      name:'Children',
      'external_link': 'https://www.gov.uk/looking-after-children-divorce',
      'external_link_desc': 'Children',
      'external_link_desc_cy': 'Children',
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null,
      'alt_name': null,
      'alt_name_cy': null
    },
    {
      id: 3,
      name:'Civil partnership',
      'external_link': 'https://www.gov.uk/end-civil-partnership',
      'external_link_desc': 'Civil Partnership',
      'external_link_desc_cy': 'Civil Partnership',
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null,
      'alt_name': null,
      'alt_name_cy': null
    },
    {
      id: 4,
      name:'Divorce',
      'external_link': 'https://www.gov.uk/divorce',
      'external_link_desc': 'Divorce',
      'external_link_desc_cy': 'Divorce',
      'display_name': null,
      'display_name_cy': null,
      'display_external_link': null,
      'alt_name': null,
      'alt_name_cy': null
    }
  ];


  const courtTypesAndCodes : CourtTypesAndCodes = {
    "types": [
      { id: 1, name:"Magistrates' Court", code: 123},
      { id: 2, name:'County Court', code: 456},
      { id: 3, name:'Crown Court', code: 789},
      { id: 4, name:'Family Court', code: null}

    ],
    "gbsCode": "123",
    "dxCodes": []
  }

  const localAuthorites: LocalAuthority[] = [
    { id: 1, name:'Barnet Borough Council'},
    { id: 2, name:'Brent Borough Council'},
    { id: 3, name:'Camden Borough Council'},
    { id: 4, name:'City of London Corporation'}
  ];

  const courtlocalAuthorites: LocalAuthority[] = [
    { id: 2, name:'Brent Borough Council'},
    { id: 3, name:'Camden Borough Council'},
  ];

  const localAuthoritiesItems: LocalAuthorityItem[] = [
    { id:1, value:'{"id":1,"name":"Barnet Borough Council"}', text:'Barnet Borough Council', checked:false },
    { id:2, value:'{"id":2,"name":"Brent Borough Council"}', text:'Brent Borough Council', checked:true },
    { id:3, value:'{"id":3,"name":"Camden Borough Council"}', text:'Camden Borough Council', checked:true },
    { id:4, value:'{"id":4,"name":"City of London Corporation"}', text:'City of London Corporation', checked:false }
  ];

  const areasOfLawItems: SelectItem[] =[
    {value:'Select a area of law', text: 'Select a area of law' , selected: true },
    {value:'Adoption', text: 'Adoption' , selected: false },
    {value:'Children', text: 'Children' , selected: false },
    {value:'Civil partnership', text: 'Civil partnership' , selected: false },
    {value:'Divorce', text: 'Divorce' , selected: false }
  ];

  const controller = new LocalAuthoritiesController();


  beforeEach(() => {
    mockApi = {
      getCourtAreasOfLaw: async (): Promise<AreaOfLaw[]> => courtAreasOfLaw,
      getCourtTypesAndCodes: async (): Promise<CourtTypesAndCodes> => courtTypesAndCodes,
      getAllLocalAuthorities: async (): Promise<LocalAuthority[]> => localAuthorites,
      getCourtLocalAuthoritiesByAreaOfLaw: async (): Promise<LocalAuthority[]> => courtlocalAuthorites,
      updateCourtLocalAuthoritiesByAreaOfLaw: async (): Promise<LocalAuthority[]> => courtlocalAuthorites
    };
  });

  test('Should get court areas of law and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.getAreasOfLaw(req, res);

    const expectedResults: LocalAuthoritiesAreaOfLaw = {
      updated: false,
      errorMsg: '',
      isEnabled: true,
      courtAreasOfLaw: areasOfLawItems
    };

    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });

  test('Should handle errors when getting court areas of law data from API', async () => {
    const slug = 'another-county-court';
    const req = mockRequest();

    req.params = { slug: slug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtAreasOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.getAreasOfLaw(req, res);

    const expectedResults: LocalAuthoritiesAreaOfLaw = {
      updated: false,
      errorMsg: controller.getCourtAreasOfLawErrorMsg,
      isEnabled: true,
      courtAreasOfLaw: []
    };
    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });

  test('Should handle errors when getting court types data from API', async () => {
    const slug = 'another-county-court';
    const req = mockRequest();

    req.params = { slug: slug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtTypesAndCodes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.getAreasOfLaw(req, res);

    const expectedResults: LocalAuthoritiesAreaOfLaw = {
      updated: false,
      errorMsg: controller.getCourtTypesErrorMsg,
      isEnabled: false,
      courtAreasOfLaw: areasOfLawItems
    };
    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });

  test('Should return message when no family court types enabled for court', async () => {
    const slug = 'another-county-court';
    const req = mockRequest();
    mockApiAreaOfLaw = {getCourtAreasOfLaw: async (): Promise<AreaOfLaw[]> => [],
      getCourtTypesAndCodes: async (): Promise<CourtTypesAndCodes> => courtTypesAndCodes,};


    req.params = { slug: slug
    };
    req.scope.cradle.api = mockApiAreaOfLaw;
    const res = mockResponse();

    await controller.getAreasOfLaw(req, res);

    const expectedResults: LocalAuthoritiesAreaOfLaw = {
      updated: false,
      errorMsg: controller.familyAreaOfLawErrorMsg,
      isEnabled: true,
      courtAreasOfLaw: []
    };
    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });



  test('Should get court local authorities and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court',
      areaOfLaw: 'AreaOfLaw'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.getLocalAuthorities(req, res);

    const expectedResults: LocalAuthoritiesPageData = {
      updated: false,
      errorMsg: '',
      selectedAreaOfLaw: 'AreaOfLaw',
      localAuthoritiesItems :localAuthoritiesItems,
      courtAreasOfLaw: areasOfLawItems
    };

    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });


  test('Should handle errors when getting court local authorities data from API', async () => {
    const req = mockRequest();

    const areasOfLawItems: SelectItem[] =[
      {value:'Adoption', text: 'Adoption' , selected: false },
      {value:'Children', text: 'Children' , selected: true },
      {value:'Civil partnership', text: 'Civil partnership' , selected: false },
      {value:'Divorce', text: 'Divorce' , selected: false }
    ];

    req.params = {
      slug: 'southport-county-court',
      areaOfLaw: 'Children'
    };

    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtLocalAuthoritiesByAreaOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.getLocalAuthorities(req, res);

    const expectedResults: LocalAuthoritiesPageData = {
      updated: false,
      errorMsg: controller.getCourtLocalAuthoritiesErrorMsg,
      selectedAreaOfLaw: 'Children',
      localAuthoritiesItems :[],
      courtAreasOfLaw: areasOfLawItems
    };
    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });

  test('Should handle errors when getting local authorities court areas of law data from API ', async () => {
    const req = mockRequest();



    req.params = {
      slug: 'southport-county-court',
      areaOfLaw: 'Children'
    };

    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtAreasOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.getLocalAuthorities(req, res);

    const expectedResults: LocalAuthoritiesPageData = {
      updated: false,
      errorMsg: controller.getCourtAreasOfLawErrorMsg,
      selectedAreaOfLaw: 'Children',
      localAuthoritiesItems :localAuthoritiesItems,
      courtAreasOfLaw: []
    };
    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });

  test('Should handle errors when getting local authorities data from API', async () => {
    const req = mockRequest();

    const areasOfLawItems: SelectItem[] =[
      {value:'Adoption', text: 'Adoption' , selected: false },
      {value:'Children', text: 'Children' , selected: true },
      {value:'Civil partnership', text: 'Civil partnership' , selected: false },
      {value:'Divorce', text: 'Divorce' , selected: false }
    ];

    req.params = {
      slug: 'southport-county-court',
      areaOfLaw: 'Children'
    };

    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getAllLocalAuthorities = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.getLocalAuthorities(req, res);

    const expectedResults: LocalAuthoritiesPageData = {
      updated: false,
      errorMsg: controller.getLocalAuthoritiesErrorMsg,
      selectedAreaOfLaw: 'Children',
      localAuthoritiesItems :[],
      courtAreasOfLaw: areasOfLawItems
    };
    expect(res.render).toBeCalledWith('courts/tabs/localAuthoritiesContent', expectedResults);
  });

  test('Should post court local authorities for area of law.', async () => {
    const slug = 'southport-county-court';
    const areaOfLaw = 'Children';
    const res = mockResponse();
    const req = mockRequest();

    const localAuthorities: string[]= [
      '{"id":2,"name":"Brent Borough Council"}',
      '{"id":3,"name":"Camden Borough Council"}',
    ];

    req.body = {
      'localAuthoritiesItems': localAuthorities,
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug, areaOfLaw: areaOfLaw };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtLocalAuthoritiesByAreaOfLaw = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtLocalAuthoritiesByAreaOfLaw).toBeCalledWith(slug, areaOfLaw, courtlocalAuthorites);
  });

  test('Should not post court local authorities for area of law if no csrf token provided .', async () => {
    const slug = 'southport-county-court';
    const areaOfLaw = 'Children';
    const res = mockResponse();
    const req = mockRequest();

    const localAuthorities: string[]= [
      '{"id":2,"name":"Brent Borough Council"}',
      '{"id":3,"name":"Camden Borough Council"}',
    ];

    req.body = {
      'localAuthoritiesItems': localAuthorities
    };

    req.params = { slug: slug, areaOfLaw: areaOfLaw };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtLocalAuthoritiesByAreaOfLaw = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtLocalAuthoritiesByAreaOfLaw).not.toBeCalled();
  });



});
