import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CSRF} from '../../../../../main/modules/csrf';
import {AddressType, CourtAddress, DisplayAddress, DisplayCourtAddresses} from '../../../../../main/types/CourtAddress';
import {AddressController} from '../../../../../main/app/controller/courts/AddressController';
import {CourtAddressPageData} from '../../../../../main/types/CourtAddressPageData';
import {County} from '../../../../../main/types/County';


describe('AddressesController', () => {

  let mockApi: {
    getCourtAddresses: () => Promise<CourtAddress[]>,
    updateCourtAddresses: () => Promise<CourtAddress[]>,
    getAddressTypes: () => Promise<AddressType[]>,
    getCounties: () => Promise<County[]>
  };

  const res = mockResponse();
  const req = mockRequest();

  const getValidCourtAddresses: () => CourtAddress[] = () => {
    return [
      {
        'type_id': 100,
        description : 'description' ,
        'description_cy' : 'description_cy,',
        'address_lines': ['54 Green Street'],
        'address_lines_cy': ['54 Green Street_cy'],
        town: 'Redville',
        'town_cy': 'Redville_cy',
        'county_id': 1,
        postcode: 'RR1 2AB'
      },
      {
        'type_id': 200,
        description : 'description' ,
        'description_cy' : 'description_cy',
        'address_lines': ['11 Yellow Road'],
        'address_lines_cy': ['11 Yellow Road_cy'],
        town: 'Brownville',
        'town_cy': 'Brownville',
        'county_id': 2,
        postcode: 'BB11 1BC'
      },
      {
        'type_id': 200,
        description : 'description' ,
        'description_cy' : 'description_cy',
        'address_lines': ['12 Yellow Road'],
        'address_lines_cy': ['12 Yellow Road_cy'],
        town: 'Birmingham',
        'town_cy': 'Birmingham',
        'county_id': 3,
        postcode: 'B1 1AA'
      }
    ];
  };

  const getValidDisplayAddresses: () => DisplayCourtAddresses = () => {
    const courtAddresses = getValidCourtAddresses();
    const primary = courtAddresses[0];
    const secondary = courtAddresses[1];
    const third = courtAddresses[2];

    return {
      primary: {
        'type_id': primary.type_id,
        'description' : primary.description,
        'description_cy' : primary.description_cy,
        'address_lines': primary.address_lines.join('\n'),
        'address_lines_cy': primary.address_lines_cy.join('\n'),
        town: primary.town,
        'town_cy': primary.town_cy,
        'county_id': 1,
        postcode: primary.postcode
      },
      secondary: {
        'type_id': secondary.type_id,
        'description' : secondary.description,
        'description_cy' : secondary.description_cy,
        'address_lines': secondary.address_lines.join('\n'),
        'address_lines_cy': secondary.address_lines_cy.join('\n'),
        town: secondary.town,
        'town_cy': secondary.town_cy,
        'county_id': 2,
        postcode: secondary.postcode
      },
      third: {
        'type_id': third.type_id,
        'description' : third.description,
        'description_cy' : third.description_cy,
        'address_lines': third.address_lines.join('\n'),
        'address_lines_cy': third.address_lines_cy.join('\n'),
        town: third.town,
        'town_cy': third.town_cy,
        'county_id': 3,
        postcode: third.postcode
      }
    };
  };

  const addressTypes: AddressType[] = [
    { id: 100, name: 'Visit us', 'name_cy': 'Visit us' },
    { id: 200, name: 'Write to us', 'name_cy': 'Write to us' },
    { id: 300, name: 'Visit or contact us' , 'name_cy': 'Visit or contact us'}
  ];

  const counties: County[] = [
    {id: 1, name:'West Midlands', country: 'England'},
    {id: 2, name:'Cardiff', country: 'Wales'},
    {id: 3, name:'Aberdeenshire', country: 'Scotland'}
  ]


  const expectedCounties: SelectItem[] = [
    { value: 1, text: 'West Midlands', selected: false },
    { value: 2, text: 'Cardiff', selected: false },
    { value: 3, text: 'Aberdeenshire' , selected: false}
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
    thirdAddress: DisplayAddress,
    expectedErrors: { text: string }[],
    primaryPostcodeInvalid: boolean,
    secondaryPostcodeInvalid: boolean,
    thirdPostcodeInvalid: boolean,
    isFatalError: boolean) => {
    return {
      addresses: {primary: primaryAddress, secondary: secondaryAddress , third :thirdAddress},
      addressTypesPrimary: expectedSelectItems,
      addressTypesSecondary: [expectedSelectItems[0], expectedSelectItems[1]],
      addressTypesThird: [expectedSelectItems[0], expectedSelectItems[1]],
      counties : expectedCounties,
      writeToUsTypeId: addressTypes[1].id,
      updated: false,
      errors: expectedErrors,
      primaryPostcodeInvalid: primaryPostcodeInvalid,
      secondaryPostcodeInvalid: secondaryPostcodeInvalid,
      thirdPostcodeInvalid: thirdPostcodeInvalid,
      fatalError: isFatalError
    };
  };

  const controller = new AddressController();

  beforeEach(() => {
    mockApi = {
      getCourtAddresses: async (): Promise<CourtAddress[]> => getValidCourtAddresses(),
      updateCourtAddresses: async (): Promise<CourtAddress[]> => getValidCourtAddresses(),
      getAddressTypes: async (): Promise<AddressType[]> => addressTypes,
      getCounties: async (): Promise<County[]> => counties
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
    // When 3 addresses already exist
    await controller.get(req, res);
    const expectedAddresses = getValidDisplayAddresses();
    let expectedResults: CourtAddressPageData =
      getExpectedResults(expectedAddresses.primary, expectedAddresses.secondary, expectedAddresses.third,[], false, false, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // When there is no secondary address or third address
    mockApi.getCourtAddresses = async () => { return [getValidCourtAddresses()[0]]; };
    await controller.get(req, res);
    expectedResults = getExpectedResults(expectedAddresses.primary, null,null,[], false, false,false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should post court addresses if addresses are valid', async () => {
    const slug = 'central-london-county-court';
    const addresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
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
      addressTypesThird: [expectedSelectItems[0], expectedSelectItems[1]],
      counties: expectedCounties,
      writeToUsTypeId: addressTypes[1].id,
      updated: false,
      errors: expectedError,
      primaryPostcodeInvalid: false,
      secondaryPostcodeInvalid: false,
      thirdPostcodeInvalid: false,
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
      addressTypesThird: [],
      counties : expectedCounties,
      writeToUsTypeId: null,
      updated: false,
      errors: expectedError,
      primaryPostcodeInvalid: false,
      secondaryPostcodeInvalid: false,
      thirdPostcodeInvalid: false,
      fatalError: true
    };

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should post court addresses if secondary and third address is empty', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = {
      'primary': getValidDisplayAddresses().primary,
      'secondary': { 'type_id': 100, description:'description', 'description_cy': 'description_cy', 'address_lines': '', 'address_lines_cy': '', town: '', 'town_cy':'', 'county_id': 1 ,postcode: '' },
      'third': { 'type_id': 100, description:'description', 'description_cy': 'description_cy', 'address_lines': '', 'address_lines_cy': '', town: '', 'town_cy':'', 'county_id': 2, postcode: '' }
    };

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateCourtAddresses).toBeCalledWith(slug, [getValidCourtAddresses()[0]]);
  });

  test('Should not post court addresses if address type not selected', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary['type_id'] = null;
    addresses.secondary['type_id'] = null;
    addresses.third['type_id'] = null;

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [
      { text: controller.primaryAddressPrefix + controller.typeRequiredError },
      { text: controller.secondaryAddressPrefix + controller.typeRequiredError },
      { text: controller.thirdAddressPrefix + controller.typeRequiredError },

    ];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address postcode is missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary.postcode = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.primaryAddressPrefix + controller.postcodeMissingError }];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, true, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address exists but postcode is missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary.postcode = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.secondaryAddressPrefix + controller.postcodeMissingError }];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, true, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address lines are missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary['address_lines'] = '';
    addresses.primary.town = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
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
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false, false,false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address exists but address lines are missing', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary['address_lines'] = '';
    addresses.secondary.town = '';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [
      { text: controller.secondaryAddressPrefix + controller.addressRequiredError},
      { text: controller.secondaryAddressPrefix + controller.townRequiredError}
    ];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address postcode is invalid', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary.postcode = 'AB1 2CDE'; // invalid

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.primaryAddressPrefix + controller.invalidPostcodeError}];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third,expectedError, true, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address postcode is invalid', async() => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    addresses.secondary.postcode = 'SW1A 99XYZ'; // invalid

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [{ text: controller.secondaryAddressPrefix + controller.invalidPostcodeError}];
    const expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, true,false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if more than one visit address is entered', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id, // Write to us
      '_csrf': CSRF.create()
    };

    // Both have different visit us types
    addresses.primary['type_id'] = addressTypes[2].id; // Visit or contact us
    addresses.secondary['type_id'] = addressTypes[0].id; // Visit us

    await controller.put(req, res);

    expect(mockApi.updateCourtAddresses).not.toBeCalled();
    let expectedError = [{ text: controller.multipleVisitAddressError}];
    let expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Both have same visit us type
    addresses.primary['type_id'] = addressTypes[0].id; // Visit us
    addresses.secondary['type_id'] = addressTypes[0].id; // Visit us

    await controller.put(req, res);

    expect(mockApi.updateCourtAddresses).not.toBeCalled();
    expectedError = [{ text: controller.multipleVisitAddressError}];
    expectedResults =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false,false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary and third descriptions is more than 50 characters', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    const tooLongDescription = 'description123456789012345678912345678901234567890112345678901234567891234567890123456789011234567890';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id, // Write to us
      '_csrf': CSRF.create()
    };


    addresses.secondary['description'] = tooLongDescription;
    addresses.secondary['description_cy'] = tooLongDescription;
    addresses.third['description'] = tooLongDescription;
    addresses.third['description_cy'] = tooLongDescription;


    await controller.put(req, res);

    expect(mockApi.updateCourtAddresses).not.toBeCalled();
    let expectedError = [{ text: controller.secondaryAddressPrefix +  controller.descriptionTooLongError},
      {text : controller.thirdAddressPrefix + controller.descriptionTooLongError}];
    let expectedResults: CourtAddressPageData =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false, false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);



    await controller.put(req, res);

    expect(mockApi.updateCourtAddresses).not.toBeCalled();
    expectedError = [{ text: controller.secondaryAddressPrefix + controller.descriptionTooLongError},
      {text : controller.thirdAddressPrefix + controller.descriptionTooLongError}];
    expectedResults =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false,false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });


  test('Put should handle Bad Request response from API', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };

    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.updateCourtAddresses = jest.fn().mockRejectedValue(errorResponse);

    // Primary postcode invalid only
    errorResponse.response.data = [addresses.primary.postcode];
    await controller.put(req, res);
    let expectedError = [{ text: controller.primaryAddressPrefix + controller.postcodeNotFoundError }];
    let expectedResults = getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, true, false, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Secondary postcode invalid only
    errorResponse.response.data = [addresses.secondary.postcode];
    await controller.put(req, res);
    expectedError = [{ text: controller.secondaryAddressPrefix + controller.postcodeNotFoundError }];
    expectedResults = getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, true,false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Both postcodes invalid and same
    addresses.primary.postcode = addresses.secondary.postcode;
    errorResponse.response.data = [addresses.primary.postcode, addresses.secondary.postcode];
    await controller.put(req, res);
    expectedError = [
      { text: controller.primaryAddressPrefix + controller.postcodeNotFoundError },
      { text: controller.secondaryAddressPrefix + controller.postcodeNotFoundError }
    ];
    expectedResults =
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, true, true, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Bad Request for reasons other than postcodes
    errorResponse.response.data = null;
    await controller.put(req, res);
    expectedError = [{ text: controller.updateAddressError }];
    expectedResults = getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false,false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Put should handle error responses from API', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
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
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false,false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if CSRF token is invalid', async() => {
    const addresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      third: addresses.third,
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
      getExpectedResults(req.body.primary, req.body.secondary, req.body.third, expectedError, false, false,false, false);

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });
});
