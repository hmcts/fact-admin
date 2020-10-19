import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import { HomeController } from '../../../../main/app/controller/HomeController';

const i18n = {
  home: {},
};

describe('Home Controller', () => {
  const controller = new HomeController();

  test('Should render the search option page', async () => {
    const req = mockRequest(i18n);
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('home', i18n.home);
  });

});
