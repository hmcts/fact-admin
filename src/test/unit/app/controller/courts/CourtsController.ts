import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { CourtsController } from '../../../../../main/app/controller/courts/CourtsController';
import {Region} from '../../../../../main/types/Region';
import {SelectItem} from '../../../../../main/types/CourtPageData';

describe('CourtsController', () => {
  const controller = new CourtsController();
  const mockApi = {
    getCourts: async (): Promise<object[]> => [],
    getRegions: async (): Promise<Region[]> => []
  };

  const regions: Region[] = [
    {id: 1, name:'North West', country: 'England'},
    {id: 2, name:'South East', country: 'England'},
    {id: 3, name:'North Wales', country: 'Wales'}
  ];

  const expectedRegions: SelectItem[] = [
    { value: 1, text: 'North West', selected: false },
    { value: 2, text: 'South East', selected: false },
    { value: 3, text: 'North Wales' , selected: false}
  ];

  test.todo('Should return regions as selectItems'), async () => {
    const courtsController = new CourtsController();
    const regionSelectItems = courtsController.getRegionsForSelect(regions);
    expect(regionSelectItems).toStrictEqual(expectedRegions);
  };

  test('Should render the courts page', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/courts', { courts: [], regionsSelect: [] });
  });

});
