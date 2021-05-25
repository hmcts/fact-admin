import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CourtTypesController} from '../../../../../main/app/controller/courts/CourtTypesController';
import {CourtType, CourtTypeItem, CourtTypePageData} from '../../../../../main/types/CourtType';
import {CSRF} from '../../../../../main/modules/csrf';


describe ( 'CourtTypesController', () =>{

  let mockApi: {
    getCourtTypes: () => Promise<CourtType[]>,
    getCourtCourtTypes: () => Promise<CourtType[]>,
    updateCourtCourtTypes: () => Promise<CourtType[]> };


  const courtTypes: CourtType[] = [
    { id: 11416, name:"Magistrates' Court", code: 123},
    { id: 11419, name:'County Court', code: 456},
    { id: 11420, name:'Crown Court', code: 789},
    { id: 4, name:'Family Court', code: null}
  ];

  const courtTypeItems: CourtTypeItem[] = [
    {value:11416, text:"Magistrates' Court", magistrate:true, county:false, crown:false, checked: true, code:123},
    {value:11419, text:'County Court', magistrate:false, county:true, crown:false, checked: true, code:456},
    {value:11420, text:'Crown Court',magistrate:false, county:false, crown:true, checked:true, code:789},
    {value:4, text:'Family Court', magistrate:false, county:false, crown:false, checked:true, code:null}

  ];

  const courtCourtTypes: CourtType[] =[
    { id: 11416, name:'11416', code: 123},
    { id: 11419, name:'11419', code: 456},
    { id: 11420, name:'11420', code: 789},
    { id: 4, name:'4', code: null}
  ];


  const controller = new CourtTypesController();

  beforeEach(() => {
    mockApi = {
      getCourtTypes: async (): Promise<CourtType[]> => courtTypes,
      updateCourtCourtTypes: async (): Promise<CourtType[]> => courtTypes,
      getCourtCourtTypes: async (): Promise<CourtType[]> => courtCourtTypes
    };
  });


  test('Should get court types view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'southport-county-court'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: '',
      items: courtTypeItems
    };

    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });

  test('Should post court court types if court types are valid', async () => {
    const slug = 'southport-county-court';
    const res = mockResponse();
    const req = mockRequest();

    const types: string[]= [
      '11416',
      '11419',
      '11420',
      '4'
    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      '_csrf': CSRF.create()

    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtCourtTypes = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtCourtTypes).toBeCalledWith(slug, courtCourtTypes);
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
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtCourtTypes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if court types data is incomplete
    expect(mockApi.updateCourtCourtTypes).not.toBeCalled();
  });

  test('Should not post court types if no court types is selected', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    req.body = {
      'types': null,
      'magistratesCourtCode' : '123',
      'countyCourtCode' : '456',
      'crownCourtCode': '789',
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtCourtTypes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if court types data is incomplete
    expect(mockApi.updateCourtCourtTypes).not.toBeCalled();
  });

  test('Should not post court types if no code code is entered', async() => {
    const slug = 'another-county-court';
    const res = mockResponse();
    const req = mockRequest();

    const types: string[]= [
      '11416',
      '11419',
      '11420',
    ];

    req.body = {
      'types': types,
      'magistratesCourtCode' : '',
      'countyCourtCode': '',
      'crownCourtCode': '',
      '_csrf': CSRF.create()
    };

    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtCourtTypes = jest.fn().mockReturnValue(res);

    await controller.put(req, res);

    // Should not call API if court types data is incomplete
    expect(mockApi.updateCourtCourtTypes).not.toBeCalled();
  });



  test('Should handle errors when getting court court types data from API', async () => {
    const slug = 'another-county-court';
    const req = mockRequest();

    req.params = { slug: slug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtCourtTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: CourtTypePageData = {
      updated: false,
      errorMsg: controller.getCourtTypesErrorMsg,
      items: []
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
      items: []
    };
    expect(res.render).toBeCalledWith('courts/tabs/typesContent', expectedResults);
  });


});
