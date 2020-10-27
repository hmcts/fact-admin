import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { CourtDetailsController } from '../../../../../main/app/controller/courts/CourtDetailsController';

describe('CourtDetailsController', () => {
  const controller = new CourtDetailsController();
  const mockApi = {
    getCourt: async (): Promise<{}> => {
      return {};
    }
  };

  test('Should render the court details page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'London'
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/court-details', {});
  });
});
