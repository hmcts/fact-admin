import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CourtTypesController} from '../../../../../main/app/controller/courts/CourtTypesController';
import {CourtType, CourtTypeItem, CourtTypePageData} from '../../../../../main/types/CourtType';
import {CSRF} from '../../../../../main/modules/csrf';
import {CourtTypesAndCodes} from "../../../../../main/types/CourtTypesAndCodes";


describe ( 'CourtTypesController', () =>{

  let mockApi: {
    getCourtTypes: () => Promise<CourtType[]>,
    getCourtTypesAndCodes: () => Promise<CourtTypesAndCodes>,
    updateCourtTypesAndCodes: () => Promise<CourtTypesAndCodes> };


  const courtTypes: CourtType[] = [
    { id: 1, name:"Magistrates' Court", code: 123},
    { id: 2, name:'County Court', code: 456},
    { id: 3, name:'Crown Court', code: 789},
    { id: 4, name:'Family Court', code: null}
  ];

  const courtTypeItems: CourtTypeItem[] = [
    {value:'{"id":1,"name":"Magistrates\' Court","code":123}',text:"Magistrates' Court", magistrate:true, county:false, crown:false, checked: true, code:123},
    {value:'{"id":2,"name":"County Court","code":456}', text:'County Court', magistrate:false, county:true, crown:false, checked: true, code:456},
    {value:'{"id":3,"name":"Crown Court","code":789}', text:'Crown Court',magistrate:false, county:false, crown:true, checked:true, code:789},
    {value:'{"id":4,"name":"Family Court","code":null}', text:'Family Court', magistrate:false, county:false, crown:false, checked:true, code:null}

  ];

  const courtTypesAndCodes: CourtTypesAndCodes ={
    "types": [
      { id: 1, name:"Magistrates' Court", code: 123},
      { id: 2, name:'County Court', code: 456},
      { id: 3, name:'Crown Court', code: 789},
      { id: 4, name:'Family Court', code: null}

    ],
    "gbsCode": null,
    "dxCodes": []
  };


  const controller = new CourtTypesController();

  beforeEach(() => {
    mockApi = {
      getCourtTypes: async (): Promise<CourtType[]> => courtTypes,
      updateCourtTypesAndCodes: async (): Promise<CourtTypesAndCodes> => courtTypesAndCodes,
      getCourtTypesAndCodes: async (): Promise<CourtTypesAndCodes> => courtTypesAndCodes
    };
  });


  test('Should get court types view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'another-county-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: '',
      items: courtTypeItems,
      gbs:null,
      dxCodes:[]
    };

    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });

  test('Should post court types and codes if court types are valid', async () => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    const types: string[]= [
      '{"id":1, "name":"Magistrates\' Court","code":123}',
      '{"id":2,"name":"County Court","code":456}',
      '{"id":3,"name":"Crown Court","code":789}',
      '{"id":4,"name":"Family Court","code":1}'
    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'gbsCode' : null ,
      'dxCodes':[],
      '_csrf': CSRF.create()

    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);


    // Should call API to save data
    expect(mockApi.updateCourtTypesAndCodes).toBeCalledWith(slug, courtTypesAndCodes);
  });

  test('Should not post court types if no csrf token provided', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'types': null,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'gbs':null,
      'dxCodes':[],
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if court types data is incomplete
    expect(mockApi.updateCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not post court types codes if no court types is selected', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'types': null,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'gbs':null,
      'dxCodes':[],
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if court types data is incomplete
    expect(mockApi.updateCourtTypesAndCodes).not.toBeCalled();
  });

  test('Should not post court types if no court code code is entered', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    const types: string[]= [
      '{"id":1,"name":"Magistrates\' Court","code":1}',
      '{"id":2,"name":"County Court","code":2}',
      '{"id":3,"name":"Crown Court","code":3}'
    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '',
      'countyCourtCode': '',
      'crownCourtCode': '',
      'gbs':null,
      'dxCodes':[],
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if court types data is incomplete
    expect(mockApi.updateCourtTypesAndCodes).not.toBeCalled();
  });



  test('Should handle errors when getting court types and codes data from API', async () => {
    const slug = 'another-county-court';
    const req = mockRequest();

    req.params = { slug: slug};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtTypesAndCodes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: controller.getCourtTypesAndCodesErrorMsg,
      items: [],
      gbs:null,
      dxCodes:[]
    };
    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });


  test('Should handle errors when getting all court types data from API', async () => {
    const slug = 'another-county-court';
    const req = mockRequest();

    req.params = { slug: slug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: controller.getCourtTypesErrorMsg,
      items: [],
      gbs: null,
      dxCodes: []
    };
    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });


});
