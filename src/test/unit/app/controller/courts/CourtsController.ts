import { mockRequest } from '../../../utils/mockRequest';
import { mockResponse } from '../../../utils/mockResponse';
import { CourtsController } from '../../../../../main/app/controller/courts/CourtsController';
import {Region} from '../../../../../main/types/Region';
import {CourtLock} from '../../../../../main/types/CourtLock';
import {GET_COURTS_ERROR, NO_MATCHING_ROLES_ERROR} from '../../../../../main/utils/error';
import {ALLOWED_ROLES} from '../../../../../main/utils/roles';


describe('CourtsController', () => {
  const controller = new CourtsController();
  const mockApiWithCourts = {
    getCourts: async (): Promise<object[]> => [
      {
        'name': 'Admiralty and Commercial Court',
        'slug': 'admiralty-and-commercial-court',
        'updated_at': '08 Jul 2022',
        'displayed': true
      }],
    getRegions: async (): Promise<Region[]> => [
      {
        'id': 1,
        'name': 'North West',
        'country': 'England',
      }],
    deleteCourtLocksByEmail: async (): Promise<CourtLock[]> => []
  };

  const mockApiWithoutCourts = {
    getCourts: async (): Promise<object[]> => [],
    getRegions: async (): Promise<Region[]> => [],
    deleteCourtLocksByEmail: async (): Promise<CourtLock[]> => []
  };

  test('Should render the courts page', async () => {
    const req = mockRequest();
    req.appSession['user']['jwt'] = {'sub': 'moshuser'};
    req.appSession['user']['jwt']['roles'] = ALLOWED_ROLES;
    req.scope.cradle.api = mockApiWithCourts;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', {
      courts: [
        {
          'name': 'Admiralty and Commercial Court',
          'slug': 'admiralty-and-commercial-court',
          'updated_at': '08 Jul 2022',
          'displayed': true
        }],
      regions: [
        {
          'id': 1,
          'name': 'North West',
          'country': 'England',
        }],
      errors: [],
      activeCourtPage: true
    });
  });

  test('Should display error message when api is down', async () => {
    const req = mockRequest();
    req.appSession['user']['jwt'] = {'sub': 'moshuser'};
    req.appSession['user']['jwt']['roles'] = ALLOWED_ROLES;
    req.scope.cradle.api = mockApiWithoutCourts;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', {
      courts: [],
      regions: [],
      errors: [{text: GET_COURTS_ERROR}],
      activeCourtPage: true
    });
  });

  test('Should render incorrect roles error message when logging in with no roles', async () => {
    const req = mockRequest();
    req.appSession['user']['jwt'] = {'sub': 'moshuser'};
    req.appSession['user']['jwt']['roles'] = [];
    req.scope.cradle.api = mockApiWithCourts;

    const res = mockResponse();
    await controller.get(req, res);
    expect(res.render).toBeCalledWith('courts/courts', {
      courts: [],
      regions: [],
      errors: [{text: NO_MATCHING_ROLES_ERROR}],
      activeCourtPage: true
    });
  });

});

