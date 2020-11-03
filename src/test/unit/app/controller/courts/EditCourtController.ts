import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EditCourtGeneralController} from '../../../../../main/app/controller/courts/EditCourtGeneralController';

describe('EditCourtController', () => {
  const court: any = {};
  const controller = new EditCourtGeneralController();
  const mockApi = {getCourt: async (): Promise<{}> => court};

  test('Should render the edit court page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'London'
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/edit-court', {court});
  });
});
