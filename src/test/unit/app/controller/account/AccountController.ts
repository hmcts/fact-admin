import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { AccountController } from '../../../../../main/app/controller/account/AccountController';


describe('AccountController', () => {
  const controller = new AccountController();

  test('Should render the account page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await controller.get(req, res);

    expect(res.render).toBeCalledWith('account/index');
  });
});
