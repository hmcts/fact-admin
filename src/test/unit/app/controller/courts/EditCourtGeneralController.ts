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
    req.session.user.isSuperAdmin = true;
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
    req.session.user.isSuperAdmin = false;
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
    req.session.user.isSuperAdmin = false;
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
      'open': 'true',
      'access_scheme': 'true',
      'urgent_message':'London Alert',
      'urgent_message_cy':'London Alert',
      'info_message': '<p>London Info</p>',
      'info_message_cy': '<p>London Info Welsh</p>',
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
      'open': 'true',
      'access_scheme': 'true',
      'urgent_message':'London Alert',
      'urgent_message_cy':'London Alert',
      'info_message': '<p>London Info</p>',
      'info_message_cy': '<p>London Info Welsh</p>',
    };
    mockApi.updateCourtGeneral = async (): Promise<{}> => {
      return {};
    };
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.post(req, res);
    expect(res.redirect).toBeCalledWith('/courts/london-slug/edit/general?updated=false');
  });

  test('Should convert open And access_schemeToBoolean', async () => {
    // eslint-disable-next-line @typescript-eslint/camelcase
    const court = { open: 'true', access_scheme: 'true' };
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    EditCourtGeneralController.convertOpenAndAccessSchemeToBoolean(court);
    expect(court.open).toBe(true);
    expect(court.access_scheme).toBe(true);
  });

  test('Should remove deleted opening times', async () => {
    const court = {
      'description': [
        'Court open',
        'Court open',
        'Court open',
        ''
      ],
      'hours': [
        '1',
        '2',
        '3',
        ''
      ],
      'deleteOpeningHours': '2',
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    EditCourtGeneralController.removeDeletedOpeningTimes(court);
    expect(court.description.length).toBe(3);
    expect(court.hours.length).toBe(3);
  });


  test('Should convert opening times', async () => {
    const court = {
      'description': [
        'Court open',
        'Court open',
        ''
      ],
      'hours': [
        '1',
        '2',
        ''
      ]
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    EditCourtGeneralController.convertOpeningTimes(court);
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    expect(court.opening_times).toStrictEqual([
      {
        'description': 'Court open',
        'hours': '1'
      },
      {
        'description': 'Court open',
        'hours': '2'
      }
    ]);
  });
});
