import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { CourtsController } from '../../../../../main/app/controller/courts/CourtsController';

describe('CourtsController', () => {
  const controller = new CourtsController();
  const mockApi = {
    getCourts: async (): Promise<object[]> => []
  };

  test('Should render the courts page', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', { courts: [] });
  });
});
