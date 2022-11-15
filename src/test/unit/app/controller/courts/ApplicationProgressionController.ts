import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {ApplicationProgression, ApplicationProgressionData} from '../../../../../main/types/ApplicationProgression';
import {ApplicationProgressionController} from '../../../../../main/app/controller/courts/ApplicationProgressionController';
import {CourtGeneralInfo} from '../../../../../main/types/CourtGeneralInfo';

describe('ApplicationProgressionController', () => {

  let mockApi: {
    getApplicationUpdates: () => Promise<ApplicationProgression[]>;
    updateApplicationUpdates: () => Promise<ApplicationProgression[]>;
    getGeneralInfo: () => Promise<CourtGeneralInfo>;
  };

  const controller = new ApplicationProgressionController();

  const applicationUpdates: () => ApplicationProgression[] = () => [
    {
      type: 'type',
      type_cy: 'type_cy',
      email: 'email@test.com',
      external_link: null,
      external_link_description: null,
      external_link_description_cy: null,
      isNew: false
    },
    {
      type: 'type 2',
      type_cy: 'type_cy 2',
      email: 'email2@test.com',
      external_link: null,
      external_link_description: null,
      external_link_description_cy: null,
      isNew: false
    }
  ];
  const updatesWithEmptyEntry: ApplicationProgression[] = applicationUpdates().concat({
    type: null,
    type_cy: null,
    email: null,
    external_link: null,
    external_link_description: null,
    external_link_description_cy: null,
    isNew: true
  });
  const updatesWithNewEntry: ApplicationProgression[] = applicationUpdates().concat({
    type: 'type 3',
    type_cy: 'type_cy 3',
    email: 'email3@test.com',
    external_link: null,
    external_link_description: null,
    external_link_description_cy: null,
    isNew: true
  });
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
    'sc_intro_paragraph_cy': '',
    'common_platform': false
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
      updated: false,
      fatalError: false
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
      errors: [{text: controller.getApplicationUpdatesErrorMsg}],
      fatalError: true
    };
    expect(res.render).toBeCalledWith(applicationUpdatesPage, expectedResults);
  });

  test('Should handle conflict errors from the API', async () => {
    const req = mockRequest();
    const res = mockResponse();
    res.response.status = 409;
    res.response.data = {'message': 'test'}
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateApplicationUpdates = jest.fn().mockRejectedValue(res);

    await controller.put(req, res);

    const expectedResults: ApplicationProgressionData = {
      application_progression: [{
        email: null, external_link: null, external_link_description: null,
        external_link_description_cy: null, isNew: true, type: null, type_cy: null
      }],
      isEnabled: courtGeneralInfo.service_centre,
      updated: false,
      errors: [{text: controller.courtLockedExceptionMsg + 'test'}],
      fatalError: false
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

  test('Should post application updates if the fields are valid', async () => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      progression: updatesWithNewEntry,
      '_csrf': CSRF.create()
    };
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateApplicationUpdates = jest.fn().mockResolvedValue(updatesWithNewEntry);
    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateApplicationUpdates).toBeCalledWith(req.params.slug, updatesWithNewEntry);
  });

  test('Should handle multiple errors when updating emails', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const postedUpdates: ApplicationProgression[] = applicationUpdates()
      .concat({
        type: '',
        type_cy: '',
        email: 'email 3',
        external_link: 'external_link 3',
        external_link_description: 'external_link_desc 3',
        external_link_description_cy: 'external_link_desc_cy 3',
        isNew: true
      })
      .concat({
        type: 'type 4',
        type_cy: 'type_cy 4',
        email: '',
        external_link: '',
        external_link_description: '',
        external_link_description_cy: '',
        isNew: true
      })
      .concat({
        type: 'type 5',
        type_cy: 'type_cy 5',
        email: '',
        external_link: 'external_link 5',
        external_link_description: '',
        external_link_description_cy: '',
        isNew: true
      })
      .concat({
        type: 'type 5a',
        type_cy: 'type_cy 5a',
        email: '',
        external_link: '',
        external_link_description: 'external_link_description 5a',
        external_link_description_cy: '',
        isNew: true
      })
      .concat({
        type: 'type 6',
        type_cy: 'type_cy 6',
        email: 'email 6',
        external_link: 'external_link 6',
        external_link_description: 'external_link_description 6',
        external_link_description_cy: '',
        isNew: true
      });
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.body = {
      progression: postedUpdates,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateApplicationUpdates = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.put(req, res);

    const expectedResults: ApplicationProgressionData = {
      application_progression: postedUpdates,
      isEnabled: true,
      updated: false,
      errors: [
        {text: controller.emptyTypeErrorMsg},
        {text: controller.emptyFieldsErrorMsg},
        {text: controller.linkFieldsErrorMsg},
        {text: controller.doubleInputErrorMsg},
        {text: controller.invalidEmailFormatErrorMsg},
        {text: controller.invalidUrlFormatErrorMsg}
      ],
      fatalError: false
    };
    expect(res.render).toBeCalledWith(applicationUpdatesPage, expectedResults);
  });


  test('Should handle error with duplicated email addresses when updating application updates (ignoring casing)', async () => {
    const req = mockRequest();
    const postedUpdates: ApplicationProgression[] = applicationUpdates().concat(
      {
        type: 'type 3',
        type_cy: 'type_cy 3',
        email: 'email2@test.com',
        external_link: null,
        external_link_description: null,
        external_link_description_cy: 'external_link_desc_cy 3',
        isNew: true
      }
    );
    req.params = {slug: 'royal-courts-of-justice'};
    req.body = {
      progression: postedUpdates,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateApplicationUpdates = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.put(req, res);
    const expectedResults: ApplicationProgressionData = {
      application_progression: postedUpdates,
      isEnabled: true,
      errors: [{text: controller.emailDuplicatedErrorMsg}],
      updated: false,
      fatalError: false
    };

    expect(res.render).toBeCalledWith(applicationUpdatesPage, expectedResults);
  });

});
