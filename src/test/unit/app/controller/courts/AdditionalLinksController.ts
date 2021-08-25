import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {AdditionalLink, AdditionalLinkData} from '../../../../../main/types/AdditionalLink';
import {AdditionalLinksController} from '../../../../../main/app/controller/courts/AdditionalLinksController';

describe('AdditionalLinksController', () => {

  let mockApi: {
    getCourtAdditionalLinks: () => Promise<AdditionalLink[]>,
    updateCourtAdditionalLinks: () => Promise<AdditionalLink[]>
  };

  const getLinks: () => AdditionalLink[] = () => [
    {
      url: 'www.test1.com', 'display_name': 'name 1', 'display_name_cy': 'name 1 cy', isNew: false
    },
    {
      url: 'www.test2.com', 'display_name': 'name 2', 'display_name_cy': null, isNew: false
    }
  ];
  const linksWithEmptyEntry: AdditionalLink[] = getLinks().concat({url: null, 'display_name': null, 'display_name_cy': null, isNew: true});
  const additionalLinksPage = 'courts/tabs/additionalLinksContent';

  const controller = new AdditionalLinksController();

  beforeEach(() => {
    mockApi = {
      getCourtAdditionalLinks: async (): Promise<AdditionalLink[]> => getLinks(),
      updateCourtAdditionalLinks: async (): Promise<AdditionalLink[]> => getLinks()
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get additional links view and render the page', async () => {
    const req = mockRequest();
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;

    const res = mockResponse();
    await controller.get(req, res);

    const expectedResults: AdditionalLinkData = {
      links: linksWithEmptyEntry,
      updated: false,
      errors: []
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should post additional links if fields are valid', async () => {
    const slug = 'royal-courts-of-justice';
    const req = mockRequest();
    req.body = {
      additionalLinks: linksWithEmptyEntry,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockResolvedValue(getLinks());

    const res = mockResponse();
    await controller.put(req, res);
    expect(mockApi.updateCourtAdditionalLinks).toBeCalledWith(slug, getLinks());
  });

  test('Should not post additional links if url is blank', async () => {
    const req = mockRequest();
    const linksWithEmptyUrl = [
      {url: '', 'display_name': 'name 1', 'display_name_cy': 'name 1 cy', isNew: true}
    ];
    req.body = {
      additionalLinks: linksWithEmptyUrl,
      '_csrf': CSRF.create()
    };
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockResolvedValue(getLinks());

    const res = mockResponse();
    await controller.put(req, res);
    expect(mockApi.updateCourtAdditionalLinks).not.toBeCalled();

    const expectedResults: AdditionalLinkData = {
      links: linksWithEmptyUrl,
      updated: false,
      errors: [{text: controller.emptyUrlOrDisplayNameErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should not post additional links if display name is blank', async () => {
    const req = mockRequest();
    const linksWithEmptyDisplayName = [
      {url: 'www.test.com', 'display_name': '', 'display_name_cy': 'name 1 cy', isNew: true}
    ];
    req.body = {
      additionalLinks: linksWithEmptyDisplayName,
      '_csrf': CSRF.create()
    };
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockResolvedValue(getLinks());

    const res = mockResponse();
    await controller.put(req, res);
    expect(mockApi.updateCourtAdditionalLinks).not.toBeCalled();

    const expectedResults: AdditionalLinkData = {
      links: linksWithEmptyDisplayName,
      updated: false,
      errors: [{text: controller.emptyUrlOrDisplayNameErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should not post additional links if url is in invalid format', async () => {
    const req = mockRequest();
    const linksWithUrlInvalidFormat = [
      {url: 'test', 'display_name': 'name 1', 'display_name_cy': 'name 2 cy', isNew: true}
    ];
    req.body = {
      additionalLinks: linksWithUrlInvalidFormat,
      '_csrf': CSRF.create()
    };
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockResolvedValue(getLinks());

    const res = mockResponse();
    await controller.put(req, res);
    expect(mockApi.updateCourtAdditionalLinks).not.toBeCalled();

    const expectedResults: AdditionalLinkData = {
      links: linksWithUrlInvalidFormat,
      updated: false,
      errors: [{text: controller.invalidUrlFormatErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should not post additional links if url is duplicated', async () => {
    const req = mockRequest();
    const linksWithDuplicatedUrl = [
      {url: 'www.test.com', 'display_name': 'name 1', 'display_name_cy': 'name 1 cy', isNew: true},
      {url: 'www.test.com', 'display_name': 'name 2', 'display_name_cy': 'name 2 cy', isNew: true}
    ];
    req.body = {
      additionalLinks: linksWithDuplicatedUrl,
      '_csrf': CSRF.create()
    };
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockResolvedValue(getLinks());

    const res = mockResponse();
    await controller.put(req, res);
    expect(mockApi.updateCourtAdditionalLinks).not.toBeCalled();

    const expectedResults: AdditionalLinkData = {
      links: linksWithDuplicatedUrl,
      updated: false,
      errors: [{text: controller.urlDuplicatedErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should not post additional links if display name is duplicated', async () => {
    const req = mockRequest();
    const linksWithDuplicatedUrl = [
      {url: 'www.test1.com', 'display_name': 'name', 'display_name_cy': 'name 1 cy', isNew: true},
      {url: 'www.test2.com', 'display_name': 'name', 'display_name_cy': 'name 2 cy', isNew: true}
    ];
    req.body = {
      additionalLinks: linksWithDuplicatedUrl,
      '_csrf': CSRF.create()
    };
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockResolvedValue(getLinks());

    const res = mockResponse();
    await controller.put(req, res);
    expect(mockApi.updateCourtAdditionalLinks).not.toBeCalled();

    const expectedResults: AdditionalLinkData = {
      links: linksWithDuplicatedUrl,
      updated: false,
      errors: [{text: controller.displayNameDuplicatedErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should handle multiple errors when posting additional links', async () => {
    const req = mockRequest();
    const linksWithMultipleErrors = [
      {url: 'www.test.com', 'display_name': 'name 1', 'display_name_cy': 'name 1 cy', isNew: false},
      {url: 'www.test.com', 'display_name': 'name 2', 'display_name_cy': 'name 2 cy', isNew: true},
      {url: '1234', 'display_name': 'name 3', 'display_name_cy': 'name 3 cy', isNew: true},
      {url: '', 'display_name': '', 'display_name_cy': 'name 4 cy', isNew: true}
    ];
    req.body = {
      additionalLinks: linksWithMultipleErrors,
      '_csrf': CSRF.create()
    };
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockResolvedValue(getLinks());

    const res = mockResponse();
    await controller.put(req, res);
    expect(mockApi.updateCourtAdditionalLinks).not.toBeCalled();

    const expectedResults: AdditionalLinkData = {
      links: linksWithMultipleErrors,
      updated: false,
      errors: [
        {text: controller.emptyUrlOrDisplayNameErrorMsg},
        {text: controller.invalidUrlFormatErrorMsg},
        {text: controller.urlDuplicatedErrorMsg}
      ]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should not post additional links if CSRF token is invalid', async () => {
    const req = mockRequest();
    req.body = {
      'additionalLinks': linksWithEmptyEntry,
      '_csrf': CSRF.create()
    };
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    const res = mockResponse();
    await controller.put(req, res);

    const expectedResults: AdditionalLinkData = {
      links: linksWithEmptyEntry,
      updated: false,
      errors: [{text: controller.updateAdditionalLinksErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should handle errors when getting additional links from API', async () => {
    const req = mockRequest();
    req.params = {slug: 'royal-courts-of-justice'};
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getCourtAdditionalLinks = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    const res = mockResponse();
    await controller.get(req, res);

    const expectedResults: AdditionalLinkData = {
      links: null,
      updated: false,
      errors: [{text: controller.getAdditionalLinksErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });

  test('Should handle errors when updating additional links', async () => {
    const req = mockRequest();
    req.params = {slug: 'royal-courts-of-justice'};
    req.body = {
      'additionalLinks': linksWithEmptyEntry,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAdditionalLinks = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    const res = mockResponse();
    await controller.put(req, res);

    const expectedResults: AdditionalLinkData = {
      links: linksWithEmptyEntry,
      updated: false,
      errors: [{text: controller.updateAdditionalLinksErrorMsg}]
    };
    expect(res.render).toBeCalledWith(additionalLinksPage, expectedResults);
  });
});
