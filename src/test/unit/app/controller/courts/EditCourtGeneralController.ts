import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EditCourtGeneralController} from '../../../../../main/app/controller/courts/EditCourtGeneralController';

describe('EditCourtGeneralController', () => {
  const court: any = {};
  const controller = new EditCourtGeneralController();
  const mockApi = {
    getCourtGeneral: async (): Promise<{}> => court,
    updateCourtGeneral: async (): Promise<{}> => court
  };

  test('Should get court and render the edit court page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'London'
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/edit-court-general', {court});
  });

  test('Should update court urgent message and render the edit court page with results', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'London'
    };
    req.body = {
      'urgent_message':'London Alert',
      'urgent_message_cy':'London Alert'
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('courts/edit-court-general', {court, updated: true});
  });
});
