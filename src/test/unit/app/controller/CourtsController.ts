import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import { CourtsController } from '../../../../main/app/controller/CourtsController';

describe('CourtsController', () => {
  const controller = new CourtsController();

  test('Should render the courts page', async () => {
    const req = mockRequest();
    req.user = true;
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts');
  });
});
