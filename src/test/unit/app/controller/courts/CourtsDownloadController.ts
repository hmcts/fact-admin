import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { CourtsDownloadController } from '../../../../../main/app/controller/courts/CourtsDownloadController';

describe('CourtsDownloadController', () => {
  const controller = new CourtsDownloadController();
  const mockApi = {
    getDownloadCourts: async (): Promise<object[]> => []
  };

  test('Should send csv ', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.send).toBeCalledTimes(1);
  });
});
