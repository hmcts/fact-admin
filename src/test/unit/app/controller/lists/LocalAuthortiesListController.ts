import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {
  LocalAuthoritiesListPageData,
  LocalAuthority, LocalAuthorityItem
} from '../../../../../main/types/LocalAuthority';
import {LocalAuthoritiesListController} from '../../../../../main/app/controller/lists/LocalAuthoritiesListController';
import {CSRF} from '../../../../../main/modules/csrf';

describe ( 'LocalAuthoritiesListController', () => {

  let mockApi: {
    getAllLocalAuthorities: () => Promise<LocalAuthority[]>,
    updateLocalAuthority: () => Promise<LocalAuthority> };



  const localAuthorites: LocalAuthority[] = [
    { id: 1, name:'Barnet Borough Council'},
    { id: 2, name:'Brent Borough Council'},
    { id: 3, name:'Camden Borough Council'},
    { id: 4, name:'City of London Corporation'}
  ];


  const localAuthoritiesItems: LocalAuthorityItem[] = [
    { id:1, value:'{"id":1,"name":"Barnet Borough Council"}', text:'Barnet Borough Council', checked:false },
    { id:2, value:'{"id":2,"name":"Brent Borough Council"}', text:'Brent Borough Council', checked:false },
    { id:3, value:'{"id":3,"name":"Camden Borough Council"}', text:'Camden Borough Council', checked:false },
    { id:4, value:'{"id":4,"name":"City of London Corporation"}', text:'City of London Corporation', checked:false }
  ];

  const updatedLocalAuthority: LocalAuthority  =  { id: 1, name:'Barnet Borough Council1'};


  const controller = new LocalAuthoritiesListController();


  beforeEach(() => {
    mockApi = {
      getAllLocalAuthorities: async (): Promise<LocalAuthority[]> => localAuthorites,
      updateLocalAuthority: async (): Promise<LocalAuthority> => updatedLocalAuthority
    };

  });


  test('Should get local authorities and render the page', async () => {
    const req = mockRequest();

    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults:  LocalAuthoritiesListPageData = {
      errorMsg: '',
      updated: false,
      selected : null,
      updatedName: '',
      localAuthorities: localAuthoritiesItems
    };

    expect(res.render).toBeCalledWith('lists/tabs/localAuthoritiesListContent', expectedResults);
  });


  test('Should handle errors when getting local authorities data from API', async () => {
    const req = mockRequest();

    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getAllLocalAuthorities = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);


    const expectedResults:  LocalAuthoritiesListPageData = {
      errorMsg: controller.getLocalAuthoritiesErrorMsg,
      updated: false,
      selected : null,
      updatedName: '',
      localAuthorities: []
    };
    expect(res.render).toBeCalledWith('lists/tabs/localAuthoritiesListContent', expectedResults);
  });



  test('Should post local authority.', async () => {

    const res = mockResponse();
    const req = mockRequest();

    const localAuthorities: string[]= [
      '{"id":1,"name":"Barnet Borough Council"}',
    ];

    req.body = {
      'localAuthorityName': 'Barnet Borough Council1',
      'localAuthorities': localAuthorities,
      '_csrf': CSRF.create()
    };

    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateLocalAuthority = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateLocalAuthority).toBeCalledWith(updatedLocalAuthority.id ,updatedLocalAuthority.name);
  });

  test('Should not post local authority if no csrf token provided .', async () => {
    const res = mockResponse();
    const req = mockRequest();

    const localAuthorities: string[]= [
      '{"id":1,"name":"Barnet Borough Council"}',
    ];

    req.body = {
      'localAuthorityName': 'Barnet Borough Council',
      'localAuthorities': localAuthorities
    };

    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateLocalAuthority = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateLocalAuthority).not.toBeCalled();
  });


  test('Should display error when local authority name is blank', async () => {
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'localAuthorityName': '',
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateLocalAuthority = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    const expectedResults:  LocalAuthoritiesListPageData = {
      errorMsg: controller.emptyLocalAuthorityErrorMsg,
      updated: false,
      selected : null,
      updatedName: '',
      localAuthorities: localAuthoritiesItems
    };

    expect(res.render).toBeCalledWith('lists/tabs/localAuthoritiesListContent', expectedResults);
  });

  test('Should display error when local authority name is invalid', async () => {
    const res = mockResponse();
    const req = mockRequest();

    const localAuthorities: string[]= [
      '{"id":1,"name":"Barnet Borough Council1"}',
    ];

    req.body = {
      'localAuthorityName': 'Barnet Borough Council1',
      'localAuthorities': localAuthorities,
      '_csrf': CSRF.create()
    };

    const localAuthoritiesItems: LocalAuthorityItem[] = [
      { id:1, value:'{"id":1,"name":"Barnet Borough Council"}', text:'Barnet Borough Council', checked:true },
      { id:2, value:'{"id":2,"name":"Brent Borough Council"}', text:'Brent Borough Council', checked:false },
      { id:3, value:'{"id":3,"name":"Camden Borough Council"}', text:'Camden Borough Council', checked:false },
      { id:4, value:'{"id":4,"name":"City of London Corporation"}', text:'City of London Corporation', checked:false }
    ];

    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateLocalAuthority = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedResults:  LocalAuthoritiesListPageData = {
      errorMsg: controller.invalidErrorMsg,
      updated: false,
      selected : updatedLocalAuthority,
      updatedName: 'Barnet Borough Council1',
      localAuthorities: localAuthoritiesItems
    };

    expect(res.render).toBeCalledWith('lists/tabs/localAuthoritiesListContent', expectedResults);
  });


  test('Should display error when local authority is duplicated', async () => {
    const res = mockResponse();
    const req = mockRequest();

    const localAuthorities: string[]= [
      '{"id":1,"name":"Barnet Borough Council1"}',
    ];

    req.body = {
      'localAuthorityName': 'Barnet Borough Council1',
      'localAuthorities': localAuthorities,
      '_csrf': CSRF.create()
    };

    const localAuthoritiesItems: LocalAuthorityItem[] = [
      { id:1, value:'{"id":1,"name":"Barnet Borough Council"}', text:'Barnet Borough Council', checked:true },
      { id:2, value:'{"id":2,"name":"Brent Borough Council"}', text:'Brent Borough Council', checked:false },
      { id:3, value:'{"id":3,"name":"Camden Borough Council"}', text:'Camden Borough Council', checked:false },
      { id:4, value:'{"id":4,"name":"City of London Corporation"}', text:'City of London Corporation', checked:false }
    ];

    const errorResponse = mockResponse();
    errorResponse.response.status = 409;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateLocalAuthority = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedResults:  LocalAuthoritiesListPageData = {
      errorMsg: controller.duplicatedErrorMsg,
      updated: false,
      selected : updatedLocalAuthority,
      updatedName: 'Barnet Borough Council1',
      localAuthorities: localAuthoritiesItems
    };

    expect(res.render).toBeCalledWith('lists/tabs/localAuthoritiesListContent', expectedResults);
  });


  test('Should display error when local authority name is not found', async () => {
    const res = mockResponse();
    const req = mockRequest();

    const localAuthorities: string[]= [
      '{"id":1,"name":"Barnet Borough Council1"}',
    ];

    req.body = {
      'localAuthorityName': 'Barnet Borough Council1',
      'localAuthorities': localAuthorities,
      '_csrf': CSRF.create()
    };

    const localAuthoritiesItems: LocalAuthorityItem[] = [
      { id:1, value:'{"id":1,"name":"Barnet Borough Council"}', text:'Barnet Borough Council', checked:true },
      { id:2, value:'{"id":2,"name":"Brent Borough Council"}', text:'Brent Borough Council', checked:false },
      { id:3, value:'{"id":3,"name":"Camden Borough Council"}', text:'Camden Borough Council', checked:false },
      { id:4, value:'{"id":4,"name":"City of London Corporation"}', text:'City of London Corporation', checked:false }
    ];

    const errorResponse = mockResponse();
    errorResponse.response.status = 404;
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateLocalAuthority = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedResults:  LocalAuthoritiesListPageData = {
      errorMsg: controller.notFoundErrorMsg,
      updated: false,
      selected : updatedLocalAuthority,
      updatedName: 'Barnet Borough Council1',
      localAuthorities: localAuthoritiesItems
    };

    expect(res.render).toBeCalledWith('lists/tabs/localAuthoritiesListContent', expectedResults);
  });



});
