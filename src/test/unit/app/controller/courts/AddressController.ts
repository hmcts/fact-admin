import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {CSRF} from '../../../../../main/modules/csrf';
import {AddressType, CourtAddress, DisplayAddress, DisplayCourtAddresses} from '../../../../../main/types/CourtAddress';
import {AddressController} from '../../../../../main/app/controller/courts/AddressController';
import {CourtAddressPageData} from '../../../../../main/types/CourtAddressPageData';
import {County} from '../../../../../main/types/County';
import {AreaOfLaw} from '../../../../../main/types/AreaOfLaw';
import {CourtType} from '../../../../../main/types/CourtType';
import {RadioItem} from '../../../../../main/types/RadioItem';


describe('AddressesController', () => {

  let mockApi: {
    getAllAreasOfLaw: () => Promise<AreaOfLaw[]>,
    getCourtTypes: () => Promise<CourtType[]>,
    getCourtAddresses: () => Promise<CourtAddress[]>,
    updateCourtAddresses: () => Promise<CourtAddress[]>,
    getAddressTypes: () => Promise<AddressType[]>,
    getCounties: () => Promise<County[]>
  };

  const res = mockResponse();
  const req = mockRequest();

  const getAreaOfLaw: (id: number, name: string) => AreaOfLaw =
    (id: number, name: string) => {
      return {
        id: id,
        name: name,
        'display_name': null,
        'display_name_cy': null,
        'display_external_link': null,
        'external_link': null,
        'external_link_desc': null,
        'external_link_desc_cy': null,
        'alt_name': null,
        'alt_name_cy': null
      };
    };

  const getCourtType: (id: number, name: string, code: number) => CourtType =
    (id: number, name: string, code: number) => {
      return {
        id: id,
        name: name,
        code: code
      };
    };

  const getRadioItem: (id: number, value: string, text: string, checked: boolean, dataPrefix: string) => RadioItem =
    (id: number, value: string, text: string, checked: boolean, dataPrefix: string) => {
      return {
        id: id,
        text: text,
        value: value,
        checked: checked,
        attributes: {
          'data-name': dataPrefix + text
        }
      };
    };

  const getAllAreasOfLawData: AreaOfLaw[] = [
    getAreaOfLaw(1, 'Adoption'),
    getAreaOfLaw(2, 'Bankruptcy'),
    getAreaOfLaw(3, 'Children'),
    getAreaOfLaw(4, 'Civil Partnership'),
    getAreaOfLaw(5, 'Court of Appeal'),
    getAreaOfLaw(6, 'Crime')
  ];

  const getAllCourtTypesData: CourtType[] = [
    getCourtType(1, 'County Court', 456),
    getCourtType(2, 'Crown Court', 789),
    getCourtType(3, 'Family Court', null)
  ];

  const getAllCourtTypes: () => CourtType[] = () => getAllCourtTypesData;
  const getAllAreasOfLaw: () => AreaOfLaw[] = () => getAllAreasOfLawData;

  const getValidCourtAddressesAPI: () => CourtAddress[] = () => {
    return [
      {
        'type_id': 100,
        description: 'description',
        'description_cy': 'description_cy,',
        'address_lines': ['54 Green Street'],
        'address_lines_cy': ['54 Green Street_cy'],
        town: 'Redville',
        'town_cy': 'Redville_cy',
        'county_id': 1,
        postcode: 'RR1 2AB',
      },
      {
        'type_id': 200,
        description: 'description',
        'description_cy': 'description_cy',
        'address_lines': ['11 Yellow Road'],
        'address_lines_cy': ['11 Yellow Road_cy'],
        town: 'Brownville',
        'town_cy': 'Brownville',
        'county_id': 2,
        postcode: 'BB11 1BC',
        fields_of_law: {
          areas_of_law: [
            getAreaOfLaw(1, 'Adoption'),
            getAreaOfLaw(3, 'Children')],
          courts: []
        }
      },
      {
        'type_id': 200,
        description: 'description',
        'description_cy': 'description_cy',
        'address_lines': ['12 Yellow Road'],
        'address_lines_cy': ['12 Yellow Road_cy'],
        town: 'Birmingham',
        'town_cy': 'Birmingham',
        'county_id': 3,
        postcode: 'B1 1AA',
        fields_of_law: {
          areas_of_law: [
            getAreaOfLaw(2, 'Bankruptcy'),
            getAreaOfLaw(4, 'Civil Partnership')],
          courts: [
            getCourtType(1, 'County Court', 456),
            getCourtType(2, 'Crown Court', 789)
          ]
        }
      }
    ];
  };

  const getValidCourtAddresses: () => CourtAddress[] = () => {
    return [
      {
        'type_id': 100,
        description: 'description',
        'description_cy': 'description_cy,',
        'address_lines': ['54 Green Street'],
        'address_lines_cy': ['54 Green Street_cy'],
        town: 'Redville',
        'town_cy': 'Redville_cy',
        'county_id': 1,
        postcode: 'RR1 2AB',

      },
      {
        'type_id': 200,
        description: 'description',
        'description_cy': 'description_cy',
        'address_lines': ['11 Yellow Road'],
        'address_lines_cy': ['11 Yellow Road_cy'],
        town: 'Brownville',
        'town_cy': 'Brownville',
        'county_id': 2,
        postcode: 'BB11 1BC',
      },
      {
        'type_id': 200,
        description: 'description',
        'description_cy': 'description_cy',
        'address_lines': ['12 Yellow Road'],
        'address_lines_cy': ['12 Yellow Road_cy'],
        town: 'Birmingham',
        'town_cy': 'Birmingham',
        'county_id': 3,
        postcode: 'B1 1AA',
      }
    ];
  };

  const getAllRadioAreasOfLaw: (dataPrefix: string) => RadioItem[] = (dataPrefix: string) => {
    return [getRadioItem(1, JSON.stringify(getAreaOfLaw(1, 'Adoption')), 'Adoption', false, dataPrefix),
      getRadioItem(2, JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')), 'Bankruptcy', false, dataPrefix),
      getRadioItem(3, JSON.stringify(getAreaOfLaw(3, 'Children')), 'Children', false, dataPrefix),
      getRadioItem(4, JSON.stringify(getAreaOfLaw(4, 'Civil Partnership')), 'Civil Partnership', false, dataPrefix),
      getRadioItem(5, JSON.stringify(getAreaOfLaw(5, 'Court of Appeal')), 'Court of Appeal', false, dataPrefix),
      getRadioItem(6, JSON.stringify(getAreaOfLaw(6, 'Crime')), 'Crime', false, dataPrefix)];
  };

  const getAllRadioCourtTypes: (dataPrefix: string) => RadioItem[] = (dataPrefix: string) => {
    return [getRadioItem(1, JSON.stringify(getCourtType(1, 'County Court', 456)), 'County Court', false, dataPrefix),
      getRadioItem(2, JSON.stringify(getCourtType(2, 'Crown Court', 789)), 'Crown Court', false, dataPrefix),
      getRadioItem(3, JSON.stringify(getCourtType(3, 'Family Court', null)), 'Family Court', false, dataPrefix)];
  };

  const getValidDisplayAddresses: () => DisplayCourtAddresses = () => {
    const courtAddresses = getValidCourtAddresses();
    const primary = courtAddresses[0];
    const secondary : CourtAddress[] = [courtAddresses[1],courtAddresses[2]] ;

    return {
      primary: {
        'type_id': primary.type_id,
        'description': primary.description,
        'description_cy': primary.description_cy,
        'address_lines': primary.address_lines.join('\n'),
        'address_lines_cy': primary.address_lines_cy.join('\n'),
        town: primary.town,
        'town_cy': primary.town_cy,
        'county_id': 1,
        postcode: primary.postcode,
        fields_of_law: {
          areas_of_law: [],
          courts: []
        }
      },
      secondary: [{
        'type_id': secondary[0].type_id,
        'description': secondary[0].description,
        'description_cy': secondary[0].description_cy,
        'address_lines': secondary[0].address_lines.join('\n'),
        'address_lines_cy': secondary[0].address_lines_cy.join('\n'),
        town: secondary[0].town,
        'town_cy': secondary[0].town_cy,
        'county_id': 2,
        postcode: secondary[0].postcode,
        fields_of_law: {
          areas_of_law: [
            getRadioItem(1, JSON.stringify(getAreaOfLaw(1, 'Adoption')), 'Adoption', true, 'secondary'),
            getRadioItem(2, JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')), 'Bankruptcy', false, 'secondary'),
            getRadioItem(3, JSON.stringify(getAreaOfLaw(3, 'Children')), 'Children', true, 'secondary'),
            getRadioItem(4, JSON.stringify(getAreaOfLaw(4, 'Civil Partnership')), 'Civil Partnership', false, 'secondary'),
            getRadioItem(5, JSON.stringify(getAreaOfLaw(5, 'Court of Appeal')), 'Court of Appeal', false, 'secondary'),
            getRadioItem(6, JSON.stringify(getAreaOfLaw(6, 'Crime')), 'Crime', false, 'secondary')
          ],
          courts: getAllRadioCourtTypes('secondary')
        }
      },
      {
        'type_id': secondary[1].type_id,
        'description': secondary[1].description,
        'description_cy': secondary[1].description_cy,
        'address_lines': secondary[1].address_lines.join('\n'),
        'address_lines_cy': secondary[1].address_lines_cy.join('\n'),
        town: secondary[1].town,
        'town_cy': secondary[1].town_cy,
        'county_id': 3,
        postcode: secondary[1].postcode,
        fields_of_law: {
          areas_of_law: [
            getRadioItem(1, JSON.stringify(getAreaOfLaw(1, 'Adoption')), 'Adoption', false, 'third'),
            getRadioItem(2, JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')), 'Bankruptcy', true, 'third'),
            getRadioItem(3, JSON.stringify(getAreaOfLaw(3, 'Children')), 'Children', false, 'third'),
            getRadioItem(4, JSON.stringify(getAreaOfLaw(4, 'Civil Partnership')), 'Civil Partnership', true, 'third'),
            getRadioItem(5, JSON.stringify(getAreaOfLaw(5, 'Court of Appeal')), 'Court of Appeal', false, 'third'),
            getRadioItem(6, JSON.stringify(getAreaOfLaw(6, 'Crime')), 'Crime', false, 'third')
          ],
          courts: [
            getRadioItem(1, JSON.stringify(getCourtType(1, 'County Court', 456)), 'County Court', true, 'third'),
            getRadioItem(2, JSON.stringify(getCourtType(2, 'Crown Court', 789)), 'Crown Court', true, 'third'),
            getRadioItem(3, JSON.stringify(getCourtType(3, 'Family Court', null)), 'Family Court', false, 'third'),
          ]
        }
      }]
    }

    ;
  };

  const addressTypes: AddressType[] = [
    {id: 100, name: 'Visit us', 'name_cy': 'Visit us'},
    {id: 200, name: 'Write to us', 'name_cy': 'Write to us'},
    {id: 300, name: 'Visit or contact us', 'name_cy': 'Visit or contact us'}
  ];

  const counties: County[] = [
    {id: 1, name: 'West Midlands', country: 'England'},
    {id: 2, name: 'Cardiff', country: 'Wales'},
    {id: 3, name: 'Aberdeenshire', country: 'Scotland'}
  ];


  const expectedCounties: SelectItem[] = [
    {value: 1, text: 'West Midlands', selected: false},
    {value: 2, text: 'Cardiff', selected: false},
    {value: 3, text: 'Aberdeenshire', selected: false}
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
    secondaryAddress: DisplayAddress[],
    expectedErrors: { text: string }[],
    primaryPostcodeInvalid: boolean,
    secondaryPostcodeInvalid: boolean,
    thirdPostcodeInvalid: boolean,
    isFatalError: boolean) => {
    return {
      addresses: {primary: primaryAddress, secondary: secondaryAddress},
      addressTypesPrimary: expectedSelectItems,
      addressTypesSecondary: [expectedSelectItems[0], expectedSelectItems[1]],
      counties: expectedCounties,
      writeToUsTypeId: addressTypes[1].id,
      updated: false,
      errors: expectedErrors,
      primaryPostcodeInvalid: primaryPostcodeInvalid,
      secondaryPostcodeInvalid: secondaryPostcodeInvalid,
      thirdPostcodeInvalid: thirdPostcodeInvalid,
      fatalError: isFatalError
    };
  };

  const setAddressExpectedFieldsOfLaw = (courtAddressInfo: CourtAddressPageData) => {
    const courtAddressInfoDuplicate = courtAddressInfo;
    courtAddressInfoDuplicate.addresses.primary.fields_of_law = {
      areas_of_law: getAllRadioAreasOfLaw('primary'),
      courts: getAllRadioCourtTypes('primary')
    };
    courtAddressInfoDuplicate.addresses.secondary[0].fields_of_law = {
      areas_of_law: getAllRadioAreasOfLaw('secondary'),
      courts: getAllRadioCourtTypes('secondary')
    };
    courtAddressInfoDuplicate.addresses.secondary[1].fields_of_law = {
      areas_of_law: getAllRadioAreasOfLaw('third'),
      courts: getAllRadioCourtTypes('third')
    };
    return courtAddressInfoDuplicate;
  };

  const controller = new AddressController();

  beforeEach(() => {
    mockApi = {
      getAllAreasOfLaw: async (): Promise<AreaOfLaw[]> => getAllAreasOfLaw(),
      getCourtTypes: async (): Promise<CourtType[]> => getAllCourtTypes(),
      getCourtAddresses: async (): Promise<CourtAddress[]> => getValidCourtAddressesAPI(),
      updateCourtAddresses: async (): Promise<CourtAddress[]> => getValidCourtAddressesAPI(),
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
      getExpectedResults(expectedAddresses.primary, expectedAddresses.secondary, [], false, false, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // When there is no secondary address or third address
    mockApi.getCourtAddresses = async () => {
      return [getValidCourtAddresses()[0]];
    };
    await controller.get(req, res);
    // Expect the secondary/third addresses to contain fields of law to allow for selection on creation of a new address
    expectedResults = getExpectedResults(expectedAddresses.primary, [{
      fields_of_law: {
        areas_of_law: getAllRadioAreasOfLaw('secondary'),
        courts: getAllRadioCourtTypes('secondary')
      }
    },
    {
      fields_of_law: {
        areas_of_law: getAllRadioAreasOfLaw('third'),
        courts: getAllRadioCourtTypes('third')
      }
    }], [], false, false, false, false);
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should post court addresses if addresses are valid', async () => {
    const slug = 'central-london-county-court';
    const addresses = getValidDisplayAddresses();
    addresses.secondary[0].secondaryFieldsOfLawRadio = 'yes';
    addresses.secondary[1].secondaryFieldsOfLawRadio = 'yes';

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      secondaryAddressAOLItems0: [
        JSON.stringify(getAreaOfLaw(1, 'Adoption')),
        JSON.stringify(getAreaOfLaw(3, 'Children'))
      ],
      secondaryAddressCourtItems: [],
      secondaryAddressAOLItems1: [
        JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')),
        JSON.stringify(getAreaOfLaw(4, 'Civil Partnership'))
      ],
      secondaryAddressCourtItems1: [
        JSON.stringify(getCourtType(1, 'County Court', 456)),
        JSON.stringify(getCourtType(2, 'Crown Court', 789))
      ],
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = {slug: slug};

    await controller.put(req, res);

    // Should call API to save data
    const expectedResults = getValidCourtAddresses();
    expectedResults[0].fields_of_law = {
      areas_of_law: [],
      courts: [],
    };
    expectedResults[1].fields_of_law = {
      areas_of_law: [
        getAreaOfLaw(1, 'Adoption'),
        getAreaOfLaw(3, 'Children')
      ],
      courts: []
    };
    expectedResults[2].fields_of_law = {
      areas_of_law: [
        getAreaOfLaw(2, 'Bankruptcy'),
        getAreaOfLaw(4, 'Civil Partnership')
      ],
      courts: [
        getCourtType(1, 'County Court', 456),
        getCourtType(2, 'Crown Court', 789)
      ]
    };
    expect(mockApi.updateCourtAddresses).toBeCalledWith(slug, expectedResults);
  });

  test('Should handle errors when getting address data from API', async () => {
    const request = mockRequest();
    request.params = {
      slug: 'southport-county-court'
    };
    request.scope.cradle.api = mockApi;
    request.scope.cradle.api.getCourtAddresses = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(request, res);

    const expectedError = [{text: controller.getAddressesError}];

    const expectedResults: CourtAddressPageData = {
      addresses: null,
      addressTypesPrimary: expectedSelectItems,
      addressTypesSecondary: [expectedSelectItems[0], expectedSelectItems[1]],
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

  test('Should handle errors when getting court types from API', async () => {
    const request = mockRequest();
    request.params = {
      slug: 'southport-county-court'
    };
    request.scope.cradle.api = mockApi;
    request.scope.cradle.api.getCourtTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(request, res);

    const expectedError = [{text: controller.getCourtTypesErrorMsg}];
    const expectedResults: CourtAddressPageData = {
      // without any court types/areas of law, there can't be any addresses
      addresses: null,
      addressTypesPrimary: expectedSelectItems,
      addressTypesSecondary: [expectedSelectItems[0], expectedSelectItems[1]],
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

  test('Should handle errors when getting areas of law from API', async () => {
    const request = mockRequest();
    request.params = {
      slug: 'southport-county-court'
    };
    request.scope.cradle.api = mockApi;
    request.scope.cradle.api.getAllAreasOfLaw = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(request, res);

    const expectedError = [{text: controller.getAreasOfLawErrorMsg}];
    const expectedResults: CourtAddressPageData = {
      // without any court types/areas of law, there can't be any addresses
      addresses: null,
      addressTypesPrimary: expectedSelectItems,
      addressTypesSecondary: [expectedSelectItems[0], expectedSelectItems[1]],
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

    const expectedError = [{text: controller.getAddressTypesError}];
    const expectedResults: CourtAddressPageData = {
      addresses: getValidDisplayAddresses(),
      addressTypesPrimary: [],
      addressTypesSecondary: [],
      counties: expectedCounties,
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
      'secondary': [{
        'type_id': 100,
        description: 'description',
        'description_cy': 'description_cy',
        'address_lines': '',
        'address_lines_cy': '',
        town: '',
        'town_cy': '',
        'county_id': 1,
        postcode: '',
        fields_of_law: null
      },
      {
        'type_id': 100,
        description: 'description',
        'description_cy': 'description_cy',
        'address_lines': '',
        'address_lines_cy': '',
        town: '',
        'town_cy': '',
        'county_id': 2,
        postcode: '',
        fields_of_law: null
      }]
    };

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = {slug: slug};

    await controller.put(req, res);

    // Should call API to save data
    const expectedResults = [getValidCourtAddresses()[0]];
    expectedResults[0].fields_of_law = {
      areas_of_law: [],
      courts: []
    };
    expect(mockApi.updateCourtAddresses).toBeCalledWith(slug, expectedResults);
  });

  test('Should not post court addresses if address type not selected', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.primary['type_id'] = null;
    addresses.secondary[0]['type_id'] = null;
    addresses.secondary[1]['type_id'] = null;

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      secondaryFieldsOfLawRadio: 'yes',
      secondaryAddressAOLItems: [],
      secondaryAddressCourtItems: [],
      thirdFieldsOfLawRadio: 'yes',
      thirdAddressAOLItems: [],
      thirdAddressCourtItems: [],
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    // Should not call API to save data
    expect(mockApi.updateCourtAddresses).not.toBeCalled();

    // Should render page with error
    const expectedError = [
      {text: controller.primaryAddressPrefix + controller.typeRequiredError},
      {text: controller.secondaryAddressPrefix + controller.typeRequiredError},
      {text: controller.thirdAddressPrefix + controller.typeRequiredError},

    ];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address postcode is missing', async () => {
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
    const expectedError = [{text: controller.primaryAddressPrefix + controller.postcodeMissingError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        true, false, false, false));

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address exists but postcode is missing', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary[0].postcode = '';

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
    const expectedError = [{text: controller.secondaryAddressPrefix + controller.postcodeMissingError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, true, false, false));

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address lines are missing', async () => {
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
      {text: controller.primaryAddressPrefix + controller.addressRequiredError},
      {text: controller.primaryAddressPrefix + controller.townRequiredError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address exists but address lines are missing', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary[0]['address_lines'] = '';
    addresses.secondary[0].town = '';

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
      {text: controller.secondaryAddressPrefix + controller.addressRequiredError},
      {text: controller.secondaryAddressPrefix + controller.townRequiredError}
    ];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if primary address postcode is invalid', async () => {
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
    const expectedError = [{text: controller.primaryAddressPrefix + controller.invalidPostcodeError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        true, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary address postcode is invalid', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    addresses.secondary[0].postcode = 'SW1A 99XYZ'; // invalid

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
    const expectedError = [{text: controller.secondaryAddressPrefix + controller.invalidPostcodeError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, true, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if more than one visit address is entered', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id, // Write to us
      '_csrf': CSRF.create()
    };

    // Both have different visit us types
    addresses.primary['type_id'] = addressTypes[2].id; // Visit or contact us
    addresses.secondary[0]['type_id'] = addressTypes[0].id; // Visit us

    await controller.put(req, res);

    expect(mockApi.updateCourtAddresses).not.toBeCalled();
    let expectedError = [{text: controller.multipleVisitAddressError}];
    let expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary,
        expectedError, false, false, false, false));

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Both have same visit us type
    addresses.primary['type_id'] = addressTypes[0].id; // Visit us
    addresses.secondary[0]['type_id'] = addressTypes[0].id; // Visit us

    await controller.put(req, res);

    expect(mockApi.updateCourtAddresses).not.toBeCalled();
    expectedError = [{text: controller.multipleVisitAddressError}];
    expectedResults =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError, false, false, false,
        false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary addresses have conflicting areas of law or court types', async () => {
    const addresses = getValidDisplayAddresses();
    addresses.secondary[0].secondaryFieldsOfLawRadio = 'yes';
    addresses.secondary[1].secondaryFieldsOfLawRadio = 'yes';
    addresses.secondary[0].fields_of_law = {
      areas_of_law: [
        getRadioItem(1, JSON.stringify(getAreaOfLaw(1, 'Adoption')), 'Adoption', true, 'secondary'),
        getRadioItem(2, JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')), 'Bankruptcy', false, 'secondary'),
        getRadioItem(3, JSON.stringify(getAreaOfLaw(3, 'Children')), 'Children', true, 'secondary'),
        getRadioItem(4, JSON.stringify(getAreaOfLaw(4, 'Civil Partnership')), 'Civil Partnership', false, 'secondary'),
        getRadioItem(5, JSON.stringify(getAreaOfLaw(5, 'Court of Appeal')), 'Court of Appeal', false, 'secondary'),
        getRadioItem(6, JSON.stringify(getAreaOfLaw(6, 'Crime')), 'Crime', false, 'secondary')
      ],
      courts: [
        getRadioItem(1, JSON.stringify(getCourtType(1, 'County Court', 456)), 'County Court', true, 'secondary'),
        getRadioItem(2, JSON.stringify(getCourtType(2, 'Crown Court', 789)), 'Crown Court', false, 'secondary'),
        getRadioItem(3, JSON.stringify(getCourtType(3, 'Family Court', null)), 'Family Court', false, 'secondary'),
      ]
    };
    addresses.secondary[1].fields_of_law = {
      areas_of_law: [
        getRadioItem(1, JSON.stringify(getAreaOfLaw(1, 'Adoption')), 'Adoption', true, 'third'),
        getRadioItem(2, JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')), 'Bankruptcy', true, 'third'),
        getRadioItem(3, JSON.stringify(getAreaOfLaw(3, 'Children')), 'Children', false, 'third'),
        getRadioItem(4, JSON.stringify(getAreaOfLaw(4, 'Civil Partnership')), 'Civil Partnership', true, 'third'),
        getRadioItem(5, JSON.stringify(getAreaOfLaw(5, 'Court of Appeal')), 'Court of Appeal', false, 'third'),
        getRadioItem(6, JSON.stringify(getAreaOfLaw(6, 'Crime')), 'Crime', false, 'third')
      ],
      courts: [
        getRadioItem(1, JSON.stringify(getCourtType(1, 'County Court', 456)), 'County Court', true, 'third'),
        getRadioItem(2, JSON.stringify(getCourtType(2, 'Crown Court', 789)), 'Crown Court', true, 'third'),
        getRadioItem(3, JSON.stringify(getCourtType(3, 'Family Court', null)), 'Family Court', false, 'third'),
      ]
    };
    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      secondaryAddressAOLItems0: [
        JSON.stringify(getAreaOfLaw(1, 'Adoption')),
        JSON.stringify(getAreaOfLaw(3, 'Children'))
      ],
      secondaryAddressCourtItems0: [
        JSON.stringify(getCourtType(1, 'County Court', 456))
      ],
      secondaryAddressAOLItems1: [
        JSON.stringify(getAreaOfLaw(1, 'Adoption')),
        JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')),
        JSON.stringify(getAreaOfLaw(4, 'Civil Partnership'))
      ],
      secondaryAddressCourtItems1: [
        JSON.stringify(getCourtType(1, 'County Court', 456)),
        JSON.stringify(getCourtType(2, 'Crown Court', 789))
      ],
      writeToUsTypeId: addressTypes[1].id, // Write to us
      '_csrf': CSRF.create()
    };

    await controller.put(req, res);

    expect(mockApi.updateCourtAddresses).not.toBeCalled();
    const expectedError = [{text: controller.fieldsOfLawDuplicateError + '"Adoption, County Court"'}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, false, false, false));
    expectedResults.addresses.secondary[0].fields_of_law = {
      areas_of_law: [getRadioItem(1, JSON.stringify(getAreaOfLaw(1, 'Adoption')), 'Adoption', true, 'secondary'),
        getRadioItem(2, JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')), 'Bankruptcy', false, 'secondary'),
        getRadioItem(3, JSON.stringify(getAreaOfLaw(3, 'Children')), 'Children', true, 'secondary'),
        getRadioItem(4, JSON.stringify(getAreaOfLaw(4, 'Civil Partnership')), 'Civil Partnership', false, 'secondary'),
        getRadioItem(5, JSON.stringify(getAreaOfLaw(5, 'Court of Appeal')), 'Court of Appeal', false, 'secondary'),
        getRadioItem(6, JSON.stringify(getAreaOfLaw(6, 'Crime')), 'Crime', false, 'secondary')],
      courts: [getRadioItem(1, JSON.stringify(getCourtType(1, 'County Court', 456)), 'County Court', true, 'secondary'),
        getRadioItem(2, JSON.stringify(getCourtType(2, 'Crown Court', 789)), 'Crown Court', false, 'secondary'),
        getRadioItem(3, JSON.stringify(getCourtType(3, 'Family Court', null)), 'Family Court', false, 'secondary')]
    };
    expectedResults.addresses.secondary[1].fields_of_law = {
      areas_of_law: [getRadioItem(1, JSON.stringify(getAreaOfLaw(1, 'Adoption')), 'Adoption', true, 'third'),
        getRadioItem(2, JSON.stringify(getAreaOfLaw(2, 'Bankruptcy')), 'Bankruptcy', true, 'third'),
        getRadioItem(3, JSON.stringify(getAreaOfLaw(3, 'Children')), 'Children', false, 'third'),
        getRadioItem(4, JSON.stringify(getAreaOfLaw(4, 'Civil Partnership')), 'Civil Partnership', true, 'third'),
        getRadioItem(5, JSON.stringify(getAreaOfLaw(5, 'Court of Appeal')), 'Court of Appeal', false, 'third'),
        getRadioItem(6, JSON.stringify(getAreaOfLaw(6, 'Crime')), 'Crime', false, 'third')],
      courts: [getRadioItem(1, JSON.stringify(getCourtType(1, 'County Court', 456)), 'County Court', true, 'third'),
        getRadioItem(2, JSON.stringify(getCourtType(2, 'Crown Court', 789)), 'Crown Court', true, 'third'),
        getRadioItem(3, JSON.stringify(getCourtType(3, 'Family Court', null)), 'Family Court', false, 'third')]
    };
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Put should handle Bad Request response from API', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();

    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = {slug: slug};

    const errorResponse = mockResponse();
    errorResponse.response.status = 400;
    req.scope.cradle.api.updateCourtAddresses = jest.fn().mockRejectedValue(errorResponse);

    // Primary postcode invalid only
    errorResponse.response.data = {'message': addresses.primary.postcode};
    await controller.put(req, res);
    let expectedError = [{text: controller.primaryAddressPrefix + controller.postcodeNotFoundError}];
    let expectedResults = setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError, true, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Secondary postcode invalid only
    errorResponse.response.data = {'message': addresses.secondary[0].postcode};
    await controller.put(req, res);
    expectedError = [{text: controller.secondaryAddressPrefix + controller.postcodeNotFoundError}];
    expectedResults = setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary,
      expectedError, false, true, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Both postcodes invalid and same
    addresses.primary.postcode = addresses.secondary[0].postcode;
    errorResponse.response.data = {'message': addresses.primary.postcode + ',' + addresses.secondary[0].postcode };
    await controller.put(req, res);
    expectedError = [
      {text: controller.primaryAddressPrefix + controller.postcodeNotFoundError},
      {text: controller.secondaryAddressPrefix + controller.postcodeNotFoundError}
    ];

    expectedResults =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        true, true, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);

    // Bad Request for reasons other than postcodes
    errorResponse.response.data = {'message':null};
    await controller.put(req, res);
    expectedError = [{text: controller.updateAddressError}];
    expectedResults = setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary,
      expectedError, false, false, false, false));
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
    req.params = {slug: slug};

    const errorResponse = mockResponse();
    errorResponse.response.status = 404;
    req.scope.cradle.api.updateCourtAddresses = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedError = [{text: controller.updateAddressError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary,
        expectedError, false, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Put should handle conflict error response from API', async () => {
    const slug = 'central-london-county-court';
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    req.body = {
      primary: addresses.primary,
      secondary: addresses.secondary,
      writeToUsTypeId: addressTypes[1].id,
      '_csrf': CSRF.create()
    };
    req.params = {slug: slug};

    const errorResponse = mockResponse();
    errorResponse.response.status = 409;
    errorResponse.response.data = {'message': 'test'};
    req.scope.cradle.api.updateCourtAddresses = jest.fn().mockRejectedValue(errorResponse);

    await controller.put(req, res);

    const expectedError = [{text: controller.courtLockedExceptionMsg + 'test'}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary,
        expectedError, false, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if CSRF token is invalid', async () => {
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
    const expectedError = [{text: controller.updateAddressError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, false, false, false));

    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary and primary address are identical', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary[0].address_lines = '54 Green Street';
    addresses.secondary[0].postcode = 'RR1 2AB';

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
    const expectedError = [{text: controller.duplicateAddressError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });

  test('Should not post court addresses if secondary and third address are identical', async () => {
    const addresses: DisplayCourtAddresses = getValidDisplayAddresses();
    addresses.secondary[0].address_lines = '12 Yellow Road';
    addresses.secondary[0].postcode = 'B1 1AA';

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
    const expectedError = [{text: controller.duplicateAddressError}];
    const expectedResults: CourtAddressPageData =
      setAddressExpectedFieldsOfLaw(getExpectedResults(req.body.primary, req.body.secondary, expectedError,
        false, false, false, false));
    expect(res.render).toBeCalledWith('courts/tabs/addressesContent', expectedResults);
  });
});
