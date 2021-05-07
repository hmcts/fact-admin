import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EditCourtController} from '../../../../../main/app/controller/courts/EditCourtController';
import {CourtPageData} from '../../../../../main/types/CourtPageData';

describe('EditCourtController', () => {
  const controller = new EditCourtController();

  test('Should get court and render the edit court page as super admin', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';

    req.params = { slug: slug };
    req.query = { name: name };
    req.session.user.isSuperAdmin = true;

    const expectedResults: CourtPageData = {
      isSuperAdmin: true,
      slug: slug,
      name: name
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page as admin', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';

    req.params = { slug: slug };
    req.query = { name: name };
    req.session.user.isSuperAdmin = false;

    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });
});
