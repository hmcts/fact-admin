import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { CourtsController } from '../../../../../main/app/controller/courts/CourtsController';

describe('CourtsController', () => {
  const controller = new CourtsController();
  const mockApiWithCourts = {
    getCourts: async (): Promise<object[]> => [
      {
        'name': 'Admiralty and Commercial Court',
        'slug': 'admiralty-and-commercial-court',
        'updated_at': '08 Jul 2022',
        'displayed': true
      }]
  };

  const mockApiWithoutCourts = {
    getCourts: async (): Promise<object[]> => []
  };

  test('Should render the courts page', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApiWithCourts;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', { courts: [
      {
        'name': 'Admiralty and Commercial Court',
        'slug': 'admiralty-and-commercial-court',
        'updated_at': '08 Jul 2022',
        'displayed': true
      }], errors : [] });
  });

  test('Should display error message when api is down', async () => {
    const req = mockRequest();
    req.scope.cradle.api = mockApiWithoutCourts;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', { courts: [], errors : [{'text': 'A problem occurred when retrieving all court information.'}] });
  });
});
