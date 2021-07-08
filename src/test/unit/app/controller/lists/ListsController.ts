import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { ListsController } from '../../../../../main/app/controller/lists/ListsController';

describe('ListsController', () => {
  const controller = new ListsController();

  test('Should render the lists page', async () => {
    const req = mockRequest();

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('lists/index');
  });
});
