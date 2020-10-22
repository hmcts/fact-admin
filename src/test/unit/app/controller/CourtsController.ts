import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import { CourtsController } from '../../../../main/app/controller/CourtsController';

const i18n = {
  courts: {},
};

describe('Home Controller', () => {
  const controller = new CourtsController();

  test('Should redirect to the login page', async () => {
    const req = mockRequest(i18n);
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.redirect).toBeCalledWith('/login');
  });

  test('Should render the courts page', async () => {
    const req = mockRequest(i18n);
    req.user = true;
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts', i18n.courts);
  });
});
