import {ServiceUnavailableController} from '../../../../main/app/controller/ServiceUnavailableController';
import {mockRequest} from '../../utils/mockRequest';
import {mockResponse} from '../../utils/mockResponse';

describe('ServiceUnavailableController', () => {
  test('renders the retired service page with the replacement admin URL', () => {
    const req = mockRequest();
    const res = mockResponse();

    new ServiceUnavailableController().get(req, res);

    expect(res.render).toHaveBeenCalledWith('service-unavailable', {
      newAdminUrl: 'https://fact-admin-frontend.aat.platform.hmcts.net',
      retiredServicePage: true
    });
  });
});
