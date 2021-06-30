import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CourtType} from '../../../../../main/types/CourtType';
import {
  LocalAuthoritiesAreaOfLaw,
  LocalAuthoritiesPageData,
  LocalAuthority, LocalAuthorityItem
} from '../../../../../main/types/LocalAuthority';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';
import {LocalAuthoritiesController} from '../../../../../main/app/controller/courts/LocalAuthoritiesController';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CSRF} from '../../../../../main/modules/csrf';

describe ( 'LocalAuthoritiesController', () => {

  let mockApi: {
    getCourtAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtCourtTypes: () => Promise<CourtType[]>,
    getLocalAuthorities: () => Promise<LocalAuthority[]>,
    getCourtLocalAuthoritiesByAreaOfLaw: () => Promise<LocalAuthority[]>,
    updateCourtLocalAuthoritiesByAreaOfLaw: () => Promise<LocalAuthority[]> };

  let mockApiAreaOfLaw: {
    getCourtAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtCourtTypes: () => Promise<CourtType[]>
  };

  const courtAreasOfLaw: AreaOfLaw[] = [
    { id: 1, name:'Adoption'},
    { id: 2, name:'Children'},
    { id: 3, name:'Civil partnership'},
    { id: 4, name:'Divorce'}
  ];

  const courtTypes: CourtType[] = [
    { id: 1, name:"Magistrates' Court", code: 123},
    { id: 2, name:'County Court', code: 456},
    { id: 3, name:'Crown Court', code: 789},
    { id: 4, name:'Family Court', code: null}
  ];

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
      getCourtCourtTypes: async (): Promise<CourtType[]> => courtTypes,
      getLocalAuthorities: async (): Promise<LocalAuthority[]> => localAuthorites,
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
    req.scope.cradle.api.getCourtCourtTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
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
      getCourtCourtTypes: async (): Promise<CourtType[]> => courtTypes,};


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
    req.scope.cradle.api.getLocalAuthorities = jest.fn().mockRejectedValue(new Error('Mock API Error'));
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
