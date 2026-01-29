import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { BulkUpdateController } from '../../../../../main/app/controller/bulk-update/BulkUpdateController';
import TinyMCEAccessabilityHelper from '../../../../../main/utils/TinyMCEAccessabilityHelper';

describe('BulkUpdateController', () => {
  const court: any = {
    'slug':'derp',
    'name':'derp derp'
  };
  const controller = new BulkUpdateController();
  const mockApi = {
    getCourts: async (): Promise<any[]> => [court],
    updateCourtsInfo: async (): Promise<void> => {}
  };
  const mceMsg =  new TinyMCEAccessabilityHelper().getMessage();

  test('Should get court and render the bulk update page as super admin', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApi;

    const expectedResults = {
      courts: [court],
      mceMsg: mceMsg,
      activeBulkUpdatePage: true
    };
    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('bulk-update/index', expectedResults);
  });

  test('Should update court info and display a message', async () => {
    const req = mockRequest();
    req.body = {
      'info': 'London Alert',
      'info_cy':'London Alert',
      'courts': ['derp']
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('bulk-update/index', { courts: [court], mceMsg: mceMsg, error: '', updated: true });
  });

  test('Should show an error if no courts are selected', async () => {
    const req = mockRequest();
    req.body = {};
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('bulk-update/index', { courts: [court], mceMsg: mceMsg, error: 'Please select one or more courts to update.', updated: false });
  });

  test('Should show an error if there are no courts are selected', async () => {
    const req = mockRequest();
    req.body = { courts: [] };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('bulk-update/index', { courts: [court], mceMsg: mceMsg, error: 'Please select one or more courts to update.', updated: false });
  });

  test('Should show an error if the API call fails', async () => {
    const req = mockRequest();
    req.body = {
      'info': 'London Alert',
      'info_cy':'London Alert',
      'courts': ['derp']
    };
    req.scope.cradle.api = mockApi;
    mockApi.updateCourtsInfo = () => Promise.reject('API call failed');

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.render).toBeCalledWith('bulk-update/index', { courts: [court], mceMsg: mceMsg, error: 'There was an error updating the court information.', updated: false });
  });

});
