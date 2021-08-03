import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CSRF} from '../../../../../main/modules/csrf';
import {AddressType, CourtAddress, DisplayAddress, DisplayCourtAddresses} from '../../../../../main/types/CourtAddress';
import {AddressController} from '../../../../../main/app/controller/courts/AddressController';
import {CourtAddressPageData} from '../../../../../main/types/CourtAddressPageData';

describe('AddressesController', () => {

  let mockApi: {
    getCourtAddresses: () => Promise<CourtAddress[]>,
    updateCourtAddresses: () => Promise<CourtAddress[]>,
    getAddressTypes: () => Promise<AddressType[]>
  };

  const res = mockResponse();
  const req = mockRequest();

  const getValidCourtAddresses: () => CourtAddress[] = () => {
    return [
      {
        'type_id': 100,
        'address_lines': ['54 Green Street'],
        'address_lines_cy': ['54 Green Street_cy'],
        town: 'Redville',
        'town_cy': 'Redville_cy',
        postcode: 'RR1 2AB'
      },
      {
        'type_id': 200,
        'address_lines': ['11 Yellow Road'],
        'address_lines_cy': ['11 Yellow Road_cy'],
        town: 'Brownville',
        'town_cy': 'Brownville',
        postcode: 'BB11 1BC'
      }
    ];
  };

  const getValidDisplayAddresses: () => DisplayCourtAddresses = () => {
    const courtAddresses = getValidCourtAddresses();
    const primary = courtAddresses[0];
    const secondary = courtAddresses[1];
    return {
      primary: {
        'type_id': primary.type_id,
        'address_lines': primary.address_lines.join('\n'),
        'address_lines_cy': primary.address_lines_cy.join('\n'),
        town: primary.town,
        'town_cy': primary.town_cy,
        postcode: primary.postcode
      },
      secondary: {
        'type_id': secondary.type_id,
        'address_lines': secondary.address_lines.join('\n'),
        'address_lines_cy': secondary.address_lines_cy.join('\n'),
        town: secondary.town,
        'town_cy': secondary.town_cy,
        postcode: secondary.postcode
      }
    };
  };

  const addressTypes: AddressType[] = [
    { id: 100, name: 'Visit us', 'name_cy': 'Visit us' },
    { id: 200, name: 'Write to us', 'name_cy': 'Write to us' },
    { id: 300, name: 'Visit or contact us' , 'name_cy': 'Visit or contact us'}
  ];

  const expectedSelectItems: SelectItem[] = [
    {
      value: addressTypes[0].id,
      text: addressTypes[0].name,
      selected: false
    },
    {
      value: addressTypes[1].id,
      text: addressTypes[1].name,
      selected: false
    },
    {
      value: addressTypes[2].id,
      text: addressTypes[2].name,
      selected: false
    },
  ];

  const getExpectedResults = (
    primaryAddress: DisplayAddress,
    secondaryAddress: DisplayAddress,
    expectedErrors: { text: string }[],
    primaryPostcodeInvalid: boolean,
    secondaryPostcodeInvalid: boolean,
    isFatalError: boolean) => {
    return {
      addresses: {primary: primaryAddress, secondary: secondaryAddress},
      addressTypesPrimary: expectedSelectItems,
      addressTypesSecondary: [expectedSelectItems[0], expectedSelectItems[1]],
      writeToUsTypeId: addressTypes[1].id,
      updated: false,
      errors: expectedErrors,
      primaryPostcodeInvalid: primaryPostcodeInvalid,
      secondaryPostcodeInvalid: secondaryPostcodeInvalid,
      fatalError: isFatalError
    };
  };

  const controller = new AddressController();

  beforeEach(() => {
    mockApi = {
      getCourtAddresses: async (): Promise<CourtAddress[]> => getValidCourtAddresses(),
      updateCourtAddresses: async (): Promise<CourtAddress[]> => getValidCourtAddresses(),
      getAddressTypes: async (): Promise<AddressType[]> => addressTypes
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    req.params = {
      slug: 'central-london-county-court'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtAddresses = jest.fn().mockResolvedValue(getValidCourtAddresses());
  });

  test('Should get addresses view and render the page', async () => {
    // When 2 addresses already exist
    await controller.get(req, res);
    const expectedAddresses = getValidDisplayAddresses();
    let expectedResults: CourtAddressPageData =
      getExpectedResults(expectedAddresses.primary, expectedAddresses.secondary, [], false, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // When there is no secondary address
    mockApi.getCourtAddresses = async () => { return [getValidCourtAddresses()[0]]; };
    await controller.get(req, res);
    expectedResults = getExpectedResults(expectedAddresses.primary, null, [], false, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should post court addresses if addresses are valid', async () => {
    const slug = 'central-london-county-court';
    const addresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtAddresses).toBeCalledWith(slug, getValidCourtAddresses());
  });

  test('Should handle errors when getting address data from API', async () => {
    const request = mockRequest();
    request.params = {
      slug: 'southport-county-court'
    };
    request.scope.cradle.api = mockApi;
    request.scope.cradle.api.getCourtAddresses = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(request, res);

    const expectedError = [{ text: controller.getAddressesError}];

    const expectedResults: CourtAddressPageData = {
      addresses: null,
      addressTypesPrimary: expectedSelectItems,
      addressTypesSecondary: [expectedSelectItems[0], expectedSelectItems[1]],
      writeToUsTypeId: addressTypes[1].id,
      updated: false,
      errors: expectedError,
      primaryPostcodeInvalid: false,
      secondaryPostcodeInvalid: false,
      fatalError: true
    };

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should handle errors when getting address types from API', async () => {
    const request = mockRequest();
    request.params = {
      slug: 'southport-county-court'
    };
    request.scope.cradle.api = mockApi;
    request.scope.cradle.api.getAddressTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(request, res);

    const expectedError = [{ text: controller.getAddressTypesError}];
    const expectedResults: CourtAddressPageData = {
      addresses: getValidDisplayAddresses(),
      addressTypesPrimary: [],
      addressTypesSecondary: [],
      writeToUsTypeId: null,
      updated: false,
      errors: expectedError,
      primaryPostcodeInvalid: false,
      secondaryPostcodeInvalid: false,
      fatalError: true
    };

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should post court addresses if secondary address is empty', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = {
      'primary': getValidDisplayAddresses().primary,
      'secondary': { 'type_id': 100, 'address_lines': '', 'address_lines_cy': '', town: '', 'town_cy':'', postcode: '' }
    };

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtAddresses).toBeCalledWith(slug, [getValidCourtAddresses()[0]]);
  });

  test('Should not post court addresses if primary address postcode is missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary.postcode = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.primaryAddressPrefix + controller.postcodeMissingError }];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, true, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address exists but postcode is missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary.postcode = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.secondaryAddressPrefix + controller.postcodeMissingError }];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, true, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address lines are missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary['address_lines'] = '';
    addresses.primary.town = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [
      { text: controller.primaryAddressPrefix + controller.addressRequiredError},
      { text: controller.primaryAddressPrefix + controller.townRequiredError}];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address exists but address lines are missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary['address_lines'] = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.secondaryAddressPrefix + controller.addressRequiredError}];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address postcode is invalid', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary.postcode = 'AB1 2CDE'; // invalid

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.primaryAddressPrefix + controller.invalidPostcodeError}];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, true, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address postcode is invalid', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    addresses.secondary.postcode = 'SW1A 99XYZ'; // invalid

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.secondaryAddressPrefix + controller.invalidPostcodeError}];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, true, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if more than one visit address is entered', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    addresses.primary['type_id'] = addressTypes[2].id; // Visit or contact us
    addresses.secondary['type_id'] = addressTypes[0].id; // Visit us

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id, // Write to us
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.multipleVisitAddressError}];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Put should handle Bad Request (invalid postcode) response from API', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };

    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.updateCourtAddresses = jest.fn().mockRejectedValue(errorResponse);

    // Both postcodes invalid
    errorResponse.response.data = [addresses.primary.postcode, addresses.secondary.postcode];
    await controller.put(req, res);
    let expectedError = [
      { text: controller.primaryAddressPrefix + controller.postcodeNotFoundError },
      { text: controller.secondaryAddressPrefix + controller.postcodeNotFoundError }
    ];
    let expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, true, true, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Primary postcode invalid only
    errorResponse.response.data = [addresses.primary.postcode];
    await controller.put(req, res);
    expectedError = [{ text: controller.primaryAddressPrefix + controller.postcodeNotFoundError }];
    expectedResults = getExpectedResults(req.body.primary, req.body.secondary, expectedError, true, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Secondary postcode invalid only
    errorResponse.response.data = [addresses.secondary.postcode];
    await controller.put(req, res);
    expectedError = [{ text: controller.secondaryAddressPrefix + controller.postcodeNotFoundError }];
    expectedResults = getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, true, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Put should handle error responses from API', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };

    const errorResponse = mockResponse();
    errorResponse.response.status = 404;
    req.scope.cradle.api.updateCourtAddresses = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedError = [ { text: controller.updateAddressError } ];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if CSRF token is invalid', async() => {
    const addresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.updateAddressError }];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });
});
