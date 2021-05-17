import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {EditCourtController} from '../../../../../main/app/controller/courts/EditCourtController';
import {CourtPageData} from '../../../../../main/types/CourtPageData';
import config from 'config';
import {when} from 'jest-when';
import Tokens from 'csrf';

describe('EditCourtController', () => {
  const controller = new EditCourtController();

  test('Should get court and render the edit court page as super admin', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const csrfTokenSecret = 'aRandomT0ken4You';
    const csrfToken = new Tokens().create(csrfTokenSecret);

    jest.mock('config');
    config.get = jest.fn();
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);

    req.params = { slug: slug };
    req.query = { name: name };
    req.session.user.isSuperAdmin = true;

    const expectedResults: CourtPageData = {
      isSuperAdmin: true,
      slug: slug,
      name: name,
      csrfToken: expect.any(String)
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });

  test('Should get court and render the edit court page as admin', async () => {
    const req = mockRequest();
    const slug = 'royal-courts-of-justice';
    const name = 'Royal Courts of Justice';
    const csrfTokenSecret = 'aRandomT0ken4You';
    const csrfToken = new Tokens().create(csrfTokenSecret);

    jest.mock('config');
    config.get = jest.fn();
    when(config.get as jest.Mock).calledWith('csrf.tokenSecret').mockReturnValue(csrfToken);

    req.params = { slug: slug };
    req.query = { name: name };
    req.session.user.isSuperAdmin = false;

    const expectedResults: CourtPageData = {
      isSuperAdmin: false,
      slug: slug,
      name: name,
      csrfToken: expect.any(String)
    };
    const res = mockResponse();

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/edit-court-general', expectedResults);
  });
});
