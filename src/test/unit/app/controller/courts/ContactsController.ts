import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {SelectItem} from '../../../../../main/types/CourtPageData';
import {Contact, ContactPageData} from '../../../../../main/types/Contact';
import {ContactType} from '../../../../../main/types/ContactType';
import {ContactsController} from '../../../../../main/app/controller/courts/ContactsController';
import {CSRF} from '../../../../../main/modules/csrf';

describe('ContactsController', () => {

  let mockApi: {
    getContacts: () => Promise<Contact[]>,
    updateContacts: () => Promise<Contact[]>,
    getContactTypes: () => Promise<ContactType[]> };

  const getContacts: () => Contact[] = () => [
    { 'type_id': 1, number: '0123 456 7890', fax: false, explanation: 'Exp 1', 'explanation_cy': 'Exp_cy 1', isNew: false },
    { 'type_id': 2, number: '0987 654 3211', fax: true, explanation: 'Exp 2', 'explanation_cy': 'Exp_cy 2', isNew: false },
    { 'type_id': 3, number: '0879 123 4556', fax: false, explanation: 'Exp 3', 'explanation_cy': 'Exp_cy 3', isNew: false }
  ];

  const contactTypes: ContactType[] = [
    { id: 54, type: 'Bankruptcy', 'type_cy': 'methdaliad'},
    { id: 89, type: 'Care cases', 'type_cy': 'Ochosion gofal'},
    { id: 15, type: 'Chancery', 'type_cy': 'Siawnsri'}
  ];

  const expectedSelectItems: SelectItem[] = [
    { value: 54, text: 'Bankruptcy', selected: false },
    { value: 89, text: 'Care cases', selected: false },
    { value: 15, text: 'Chancery', selected: false }
  ];

  const controller = new ContactsController();

  beforeEach(() => {
    mockApi = {
      getContacts: async (): Promise<Contact[]> => getContacts(),
      updateContacts: async (): Promise<Contact[]> => getContacts(),
      getContactTypes: async (): Promise<ContactType[]> => contactTypes
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);
  });

  test('Should get phone numbers view and render the page', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.scope.cradle.api = mockApi;
    const res = mockResponse();

    await controller.get(req, res);

    // Empty entry expected for adding new phone numbers
    const expectedContacts = getContacts().concat([{ 'type_id': null, number: null, fax: false, explanation: '', 'explanation_cy': '', isNew: true }]);

    const expectedResults: ContactPageData = {
      contacts: expectedContacts,
      contactTypes: expectedSelectItems,
      updated: false,
      errorMsg: ''
    };
    expect(res.render).toBeCalledWith('courts/tabs/phoneNumbersContent', expectedResults);
  });

  test('Should post contacts if phone numbers are valid', async () => {
    const slug = 'royal-courts-of-justice';
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'contacts': getContacts(),
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateContacts = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateContacts).toBeCalledWith(slug, getContacts());
  });

  test('Should post contacts if phone number has no type id but is a fax number', async () => {
    const slug = 'royal-courts-of-justice';
    const res = mockResponse();
    const req = mockRequest();

    const postedContacts: Contact[] = [
      // No type selected in first phone number but is fax number
      { 'type_id': null, number: '01234 555 6060', fax: true, explanation: 'explanation1', 'explanation_cy': 'expl2welsh', isNew: false },
      { 'type_id': 22, number: '0432 111 9090', fax: true, explanation: 'explanation2', 'explanation_cy': 'expl2 welsh', isNew: false }
    ];

    req.body = {
      'contacts': postedContacts,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateContacts = jest.fn().mockResolvedValue(res);

    await controller.put(req, res);

    // Should call API to save data
    expect(mockApi.updateContacts).toBeCalledWith(slug, postedContacts);
  });

  test('Should not post contacts if description or number field is empty', async() => {
    const slug = 'royal-courts-of-justice';
    const res = mockResponse();
    const req = mockRequest();
    const postedContacts: Contact[] = [
      { 'type_id': 54, number: '01234 555 6060', fax: false, explanation: 'explanation1', 'explanation_cy': 'expl2welsh', isNew: false },
      { 'type_id': 89, number: '0432 111 9090', fax: true, explanation: 'explanation2', 'explanation_cy': 'expl2 welsh', isNew: false }
    ];

    req.body = {
      'contacts': postedContacts,
      '_csrf': CSRF.create()
    };
    req.params = { slug: slug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateContacts = jest.fn().mockReturnValue(res);

    // No description selected
    req.body.contacts[0]['type_id'] = null;
    await controller.put(req, res);
    expect(mockApi.updateContacts).not.toBeCalled();

    // No number entered
    req.body.contacts[0]['type_id'] = 54;
    req.body.contacts[1].number = '';
    await controller.put(req, res);
    expect(mockApi.updateContacts).not.toBeCalled();
  });

  test('Should not post contacts if CSRF token is invalid', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const postedContacts: Contact[] = [
      { 'type_id': 54, number: '01234 555 6060', fax: false, explanation: 'explanation1', 'explanation_cy': 'expl1 welsh', isNew: false },
      { 'type_id': 89, number: '0432 111 9090', fax: false, explanation: 'explanation2', 'explanation_cy': 'expl2 welsh', isNew: false }
    ];

    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.body = {
      'contacts': postedContacts,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    (CSRF.verify as jest.Mock).mockReturnValue(false);

    await controller.put(req, res);

    const expectedResults: ContactPageData = {
      contacts: postedContacts,
      contactTypes: expectedSelectItems,
      updated: false,
      errorMsg: controller.updateErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/phoneNumbersContent', expectedResults);
  });

  test('Should handle errors when getting contacts data from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getContacts = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: ContactPageData = {
      contacts: null,
      contactTypes: expectedSelectItems,
      updated: false,
      errorMsg: controller.getContactsErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/phoneNumbersContent', expectedResults);
  });

  test('Should handle errors when getting contact types from API', async () => {
    const req = mockRequest();
    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.getContactTypes = jest.fn().mockRejectedValue(new Error('Mock API Error'));
    const res = mockResponse();

    await controller.get(req, res);

    const expectedResults: ContactPageData = {
      contacts: getContacts(),
      contactTypes: [],
      updated: false,
      errorMsg: controller.getContactTypesErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/phoneNumbersContent', expectedResults);
  });

  test('Should handle errors when posting contacts from API', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const postedContacts: Contact[] = [
      { 'type_id': 54, number: '01234 555 6060', fax: false, explanation: 'explanation1', 'explanation_cy': 'expl1 welsh', isNew: false },
      { 'type_id': 89, number: '0432 111 9090', fax: false, explanation: 'explanation2', 'explanation_cy': 'expl2 welsh', isNew: false }
    ];

    req.params = {
      slug: 'royal-courts-of-justice'
    };
    req.body = {
      'contacts': postedContacts,
      '_csrf': CSRF.create()
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateContacts = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.put(req, res);

    const expectedResults: ContactPageData = {
      contacts: postedContacts,
      contactTypes: expectedSelectItems,
      updated: false,
      errorMsg: controller.updateErrorMsg
    };
    expect(res.render).toBeCalledWith('courts/tabs/phoneNumbersContent', expectedResults);
  });
});
