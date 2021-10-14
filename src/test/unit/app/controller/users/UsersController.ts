import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { UserController } from '../../../../../main/app/controller/users/UserController';


describe('UsersController', () => {
  const controller = new UserController();

  test('Should render the account page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('users/index');
  });
});
