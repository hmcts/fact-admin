import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import { HomeController } from '../../../../main/app/controller/HomeController';

describe('HomeController', () => {
  const controller = new HomeController();

  test('Should render the home page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('home');
  });

});
