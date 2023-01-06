import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { CourtsController } from '../../../../../main/app/controller/courts/CourtsController';
import {Region} from '../../../../../main/types/Region';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CourtLock} from '../../../../../main/types/CourtLock';


describe('CourtsController', () => {
  const controller = new CourtsController();
  const mockApiWithCourts = {
    getCourts: async (): Promise<object[]> => [
      {
        'name': 'Admiralty and Commercial Court',
        'slug': 'admiralty-and-commercial-court',
        'updated_at': '08 Jul 2022',
        'displayed': true
      }],
    getRegions: async (): Promise<Region[]> => [],
    deleteCourtLocksByEmail: async (): Promise<CourtLock[]> => []
  };

  const mockApiWithoutCourts = {
    getCourts: async (): Promise<object[]> => [],
    getRegions: async (): Promise<Region[]> => [],
    deleteCourtLocksByEmail: async (): Promise<CourtLock[]> => []
  };

  const regions: Region[] = [
    {id: 1, name: 'North West', country: 'England'},
    {id: 2, name: 'South East', country: 'England'},
    {id: 3, name: 'North Wales', country: 'Wales'}
  ];

  const expectedRegions: SelectItem[] = [
    {value: 1, text: 'North West', selected: false},
    {value: 2, text: 'South East', selected: false},
    {value: 3, text: 'North Wales', selected: false}
  ];

  test('Should render the courts page', async () => {
    const req = mockRequest();
    req.session['user']['jwt'] = {'sub': 'moshuser'};
    req.scope.cradle.api = mockApiWithCourts;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', {
      courts: [
        {
          'name': 'Admiralty and Commercial Court',
          'slug': 'admiralty-and-commercial-court',
          'updated_at': '08 Jul 2022',
          'displayed': true
        }], regionsSelect: [], errors: []
    });
  });

  test('Should display error message when api is down', async () => {
    const req = mockRequest();
    req.session['user']['jwt'] = {'sub': 'moshuser'};
    req.scope.cradle.api = mockApiWithoutCourts;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', {
      courts: [],
      regionsSelect: [],
      errors: [{text: controller.getCourtsErrorMsg}]
    });
  });

  test.todo('Should return regions as selectItems'), async () => {
    const courtsController = new CourtsController();
    const regionSelectItems = courtsController.getRegionsForSelect(regions);
    expect(regionSelectItems).toStrictEqual(expectedRegions);
  };
});

