import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EditCourtGeneralController} from '../../../../../main/app/controller/courts/EditCourtGeneralController';

describe('EditCourtGeneralController', () => {
  const court: any = {
    'urgent_message':'urgent',
    'urgent_message_cy':'urgent welsh',
    'info': 'info',
    'info-cy': 'info'
  };
  const controller = new EditCourtGeneralController();
  const mockApi = {
    getCourtGeneral: async (): Promise<{}> => court,
    updateCourtGeneral: async (): Promise<{}> => court
  };

  test('Should get court and render the edit court page as super admin', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'London'
    };
    req.session.user.roles = ['fact-super-admin'];
    req.scope.cradle.api = mockApi;

    const expectedResults = {
      isSuperAdmin: true,
      court: court,
      updated: false
    };
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page as admin', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'London'
    };
    req.session.user.roles = ['fact-admin'];
    req.scope.cradle.api = mockApi;

    const expectedResults = {
      isSuperAdmin: false,
      court: court,
      updated: false
    };
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page with updated field', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'London'
    };
    req.query = {
      updated: 'true'
    };
    req.session.user.roles = ['fact-admin'];
    req.scope.cradle.api = mockApi;

    const expectedResults = {
      isSuperAdmin: false,
      court: court,
      updated: true
    };
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should update court urgent message and render the edit court page with results', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'london-slug'
    };
    req.body = {
      'urgent_message':'London Alert',
      'urgent_message_cy':'London Alert'
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.redirect).toBeCalledWith('/courts/london-slug/edit/general?updated=true');
  });

  test('Should redirect with updated as false if error', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'london-slug'
    };
    req.body = {
      'urgent_message':'London Alert',
      'urgent_message_cy':'London Alert'
    };
    mockApi.updateCourtGeneral = async (): Promise<{}> => {
      return {};
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.redirect).toBeCalledWith('/courts/london-slug/edit/general?updated=false');
  });
});
