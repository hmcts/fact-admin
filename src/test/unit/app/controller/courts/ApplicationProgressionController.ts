import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {ApplicationProgression, ApplicationProgressionData} from '../../../../../main/types/ApplicationProgression';
import {ApplicationProgressionController} from '../../../../../main/app/controller/courts/ApplicationProgressionController';
import {CourtGeneralInfo} from '../../../../../main/types/CourtGeneralInfo';

describe('ApplicationProgressionController', () => {

  let mockApi: {
    getApplicationUpdates: () => Promise<ApplicationProgression[]>,
    updateApplicationUpdates: () => Promise<ApplicationProgression[]>,
    getGeneralInfo: () => Promise<CourtGeneralInfo>
  };

  const controller = new ApplicationProgressionController();

  const applicationUpdates: () => ApplicationProgression[] = () => [
    {
      type: 'type', type_cy:'type_cy', email: 'email', external_link: 'external_link', external_link_description: 'external_link_description', external_link_description_cy: 'external_link_description_cy', isNew: false
    },
    {
      type: 'type 2', type_cy:'type_cy 2', email: 'email 2', external_link: 'external_link 2', external_link_description: 'external_link_description 2', external_link_description_cy: 'external_link_description_cy 2', isNew: false
    }
  ];

  const updatesWithEmptyEntry: ApplicationProgression[] = applicationUpdates().concat({type: null, type_cy: null, email: null, external_link: null, external_link_description: null, external_link_description_cy: null, isNew: true});
  const updatesWithNewEntry: ApplicationProgression[] = applicationUpdates().concat({type: 'type 3', type_cy: 'type_cy 3', email: 'email 3', external_link: 'external_link 3', external_link_description: 'external_link_desc 3', external_link_description_cy: 'external_link_desc_cy 3', isNew: true});
  const applicationUpdatesPage = 'courts/tabs/applicationProgressionContent';


  const courtGeneralInfo: CourtGeneralInfo = {
    name: 'court name',
    open: true,
    'access_scheme': false,
    info: 'info',
    'info_cy': 'info cy',
    alert: 'an alert',
    'alert_cy': 'an alert cy',
    'in_person': true,
    'service_centre': true,
    'sc_intro_paragraph': '',
    'sc_intro_paragraph_cy': ''
  };


  beforeEach(() => {
    mockApi = {
      getApplicationUpdates: async (): Promise<ApplicationProgression[]> => applicationUpdates(),
      updateApplicationUpdates: async (): Promise<ApplicationProgression[]> => applicationUpdates(),
      getGeneralInfo: async (): Promise<CourtGeneralInfo> => courtGeneralInfo
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get application updates view and render the page', async () => {
    const req = mockRequest();
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);

    const expectedResults: ApplicationProgressionData = {
      application_progression: updatesWithEmptyEntry,
      isEnabled: courtGeneralInfo.service_centre,
      errors: [],
      updated: false
    };
    expect(res.render).toBeCalledWith(applicationUpdatesPage, expectedResults);
  });

  test('Should handle errors when getting application updates from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getApplicationUpdates = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: ApplicationProgressionData = {
      application_progression: null,
      isEnabled: courtGeneralInfo.service_centre,
      updated: false,
      errors: [{text: controller.getApplicationUpdatesErrorMsg}]
    };
    expect(res.render).toBeCalledWith(applicationUpdatesPage, expectedResults);
  });

  test('Should not post application updates if CSRF token is invalid', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.body = {
      application_progression: updatesWithNewEntry,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateApplicationUpdates = jest.fn().mockReturnValue(res);
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    await controller.put(req, res);

    expect(mockApi.updateApplicationUpdates).not.toBeCalled();
  });


});
