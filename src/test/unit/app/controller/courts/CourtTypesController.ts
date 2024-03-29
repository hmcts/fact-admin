import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CourtTypesController} from '../../../../../main/app/controller/courts/CourtTypesController';
import {CourtType, CourtTypeItem, CourtTypePageData} from '../../../../../main/types/CourtType';
import {CSRF} from '../../../../../main/modules/csrf';
import {CourtTypesAndCodes} from '../../../../../main/types/CourtTypesAndCodes';


describe ( 'CourtTypesController', () =>{

  let mockApi: {
    getCourtTypes: () => Promise<CourtType[]>;
    getCourtTypesAndCodes: () => Promise<CourtTypesAndCodes>;
    updateCourtTypesAndCodes: () => Promise<CourtTypesAndCodes>;};

  const courtTypes: CourtType[] = [
    { id: 1, name:"Magistrates' Court", code: 123},
    { id: 2, name:'County Court', code: 456},
    { id: 3, name:'Crown Court', code: 789},
    { id: 4, name:'Family Court', code: 234}
  ];

  const courtTypeItems: CourtTypeItem[] = [
    {value:'{"id":1,"name":"Magistrates\' Court","code":123}',text:"Magistrates' Court", magistrate:true, family:false, tribunal:false, county:false, crown:false, checked: true, code:123},
    {value:'{"id":2,"name":"County Court","code":456}', text:'County Court', magistrate:false, family:false, tribunal:false, county:true, crown:false, checked: true, code:456},
    {value:'{"id":3,"name":"Crown Court","code":789}', text:'Crown Court',magistrate:false, family:false, tribunal:false, county:false, crown:true, checked:true, code:789},
    {value:'{"id":4,"name":"Family Court","code":234}', text:'Family Court', magistrate:false, family:true, tribunal:false, county:false, crown:false, checked:true, code:234}

  ];

  const courtTypesAndCodes: CourtTypesAndCodes ={
    'types': [
      { id: 1, name:"Magistrates' Court", code: 123},
      { id: 2, name:'County Court', code: 456},
      { id: 3, name:'Crown Court', code: 789},
      { id: 4, name:'Family Court', code: 234}

    ],
    'gbsCode': '123',
    'dxCodes': [
      { code: '123', explanation: 'explanation', explanationCy: 'explanationCy', isNew: false },
      { code: null, explanation: null, explanationCy: null, isNew: true }
    ]
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
      courtTypes: courtTypeItems,
      gbs:courtTypesAndCodes.gbsCode,
      dxCodes:courtTypesAndCodes.dxCodes,
      fatalError: false
    };

    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });

  test('Should post court types if court types are valid for admin', async () => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();


    const types: string[]= [
      '{"id":1,"name":"Magistrates\' Court","code":123}',
      '{"id":2,"name":"County Court","code":456}',
      '{"id":3,"name":"Crown Court","code":789}',
      '{"id":4,"name":"Family Court","code":1}'
    ];

    const expectedCourtTypesAndCodes: CourtTypesAndCodes ={
      'types': [
        { id: 1, name:"Magistrates' Court", code: 123},
        { id: 2, name:'County Court', code: 456},
        { id: 3, name:'Crown Court', code: 789},
        { id: 4, name:'Family Court', code: 1}

      ],
      'gbsCode': null,
      'dxCodes': [
        { code: null, explanation: null, explanationCy: null, isNew: true }
      ]

    };
    req.body = {
      'types': types,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'familyCourtCode': '1',
      'gbsCode' : expectedCourtTypesAndCodes.gbsCode ,
      'dxCodes':expectedCourtTypesAndCodes.dxCodes,
      '_csrf': CSRF.create()

    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.appSession.user.isSuperAdmin = false;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockResolvedValue(res);


    await controller.put(req, res);


    // Should call API to save data
    expect(mockApi.updateCourtTypesAndCodes).toBeCalledWith(slug, expectedCourtTypesAndCodes);
  });

  test('Should post valid court types and codes for SuperAdmin', async () => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    const types: string[]= [
      '{"id":1,"name":"Magistrates\' Court","code":123}',
      '{"id":2,"name":"County Court","code":456}',
      '{"id":3,"name":"Crown Court","code":789}',
      '{"id":4,"name":"Family Court","code":234}'
    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'familyCourtCode': '234',
      'gbsCode' : courtTypesAndCodes.gbsCode ,
      'dxCodes':courtTypesAndCodes.dxCodes,
      '_csrf': CSRF.create()

    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.appSession.user.isSuperAdmin = true;
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

  test('Should display error message if dx code is duplicated ', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const types: string[]= [
      '{"id":1,"name":"Magistrates\' Court","code":1}',
      '{"id":2,"name":"County Court","code":2}',
      '{"id":3,"name":"Crown Court","code":3}',
      '{"id":4,"name":"Family Court","code":4}'

    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'familyCourtCode': '234',
      'gbsCode':courtTypesAndCodes.gbsCode,
      'dxCodes':[
        { code: '123', explanation: 'explanation', explanationCy: 'explanationCy', isNew: false },
        { code: '123', explanation: 'explanation', explanationCy: 'explanationCy', isNew: false },
        { code: null, explanation: null, explanationCy: null, isNew: true }
      ],
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.appSession.user.isSuperAdmin = true;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: controller.duplicatedDxCodeErrorMsg,
      courtTypes: courtTypeItems,
      gbs: courtTypesAndCodes.gbsCode,
      dxCodes:[
        { code: '123', explanation: 'explanation', explanationCy: 'explanationCy', isNew: false, isDuplicated: true },
        { code: '123', explanation: 'explanation', explanationCy: 'explanationCy', isNew: false, isDuplicated: true },
        { code: null, explanation: null, explanationCy: null, isNew: true }
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });

  test('Should display error message if dx code is empty ', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();
    const types: string[]= [
      '{"id":1,"name":"Magistrates\' Court","code":1}',
      '{"id":2,"name":"County Court","code":2}',
      '{"id":3,"name":"Crown Court","code":3}',
      '{"id":4,"name":"Family Court","code":4}'

    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'familyCourtCode': '234',
      'gbsCode':courtTypesAndCodes.gbsCode,
      'dxCodes':[
        { code: '', explanation: 'explanation', explanationCy: 'explanationCy', isNew: false },
        { code: null, explanation: null, explanationCy: null, isNew: true }
      ],
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.appSession.user.isSuperAdmin = true;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: controller.emptyDxCodeErrorMsg,
      courtTypes: courtTypeItems,
      gbs: courtTypesAndCodes.gbsCode,
      dxCodes:[
        { code: '', explanation: 'explanation', explanationCy: 'explanationCy', isNew: false,},
        { code: null, explanation: null, explanationCy: null, isNew: true }
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
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

  test('Should not post court types if conflict found', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    res.response.status = 409;
    res.response.data = {'message': 'test'};
    const req = mockRequest();

    const types: string[]= [
      '{"id":1,"name":"Magistrates\' Court","code":1}',
      '{"id":2,"name":"County Court","code":2}',
      '{"id":3,"name":"Crown Court","code":3}',
      '{"id":4,"name":"Family Court","code":4}'
    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      'familyCourtCode': '234',
      'gbsCode':courtTypesAndCodes.gbsCode,
      'dxCodes':[
        { code: null, explanation: 'explanation', explanationCy: 'explanationCy', isNew: false },
        { code: null, explanation: null, explanationCy: null, isNew: true }
      ],
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtTypesAndCodes = jest.fn().mockRejectedValue(res);

    await controller.put(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: controller.courtLockedExceptionMsg + 'test',
      courtTypes: courtTypeItems,
      gbs: courtTypesAndCodes.gbsCode,
      dxCodes:[
        { code: null, explanation: 'explanation', explanationCy: 'explanationCy', isNew: false,},
        { code: null, explanation: null, explanationCy: null, isNew: true }
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });

  test('Should handle errors when getting court types and codes data from API', async () => {
    const slug = 'another-county-court';
    const req = mockRequest();

    req.params = { slug: slug};
    req.scope.cradle.api = mockApi;
    req.appSession.user.isSuperAdmin = true;
    req.scope.cradle.api.getCourtTypesAndCodes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: controller.getCourtTypesAndCodesErrorMsg,
      courtTypes: [],
      gbs:null,
      dxCodes:[],
      fatalError: true
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
      courtTypes: [],
      gbs: courtTypesAndCodes.gbsCode,
      dxCodes: courtTypesAndCodes.dxCodes,
      fatalError: true
    };
    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });

});
