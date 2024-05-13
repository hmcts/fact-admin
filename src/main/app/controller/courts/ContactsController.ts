import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';
import {Contact, ContactPageData} from '../../../types/Contact';
import {ContactType} from '../../../types/ContactType';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {Error} from '../../../types/Error';

@autobind
export class ContactsController {

  emptyDescriptionErrorMsg = 'Description is required for phone number ';
  emptyNumberErrorMsg = 'Number is required for phone number ';
  emptyTypeOrNumberErrorMsg = 'Description and number are required for all phone number entries.';
  updateErrorMsg = 'A problem occurred when saving the phone numbers.';
  getContactsErrorMsg = 'A problem occurred when retrieving the phone numbers.';
  getContactTypesErrorMsg = 'A problem occurred when retrieving the phone number types.';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';

  /**
   * GET /courts/:slug/contacts
   * render the view with data from database for contacts tab
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMessages: Error[] = [],
    contacts: Contact[] = null): Promise<void> {

    const slug: string = req.params.slug;
    let fatalError = false;

    if (!contacts) {
      // Get contacts from API and set the isNew property to false on each if API call successful.
      await req.scope.cradle.api.getContacts(slug)
        .then((value: Contact[]) => contacts = value.map(c => { c.isNew = false; return c; }))
        .catch(() => {errorMessages.push({text:this.getContactsErrorMsg}); fatalError= true; });
    }

    let types: ContactType[] = [];
    await req.scope.cradle.api.getContactTypes()
      .then((value: ContactType[]) => types = value)
      .catch(() => {errorMessages.push({text:this.getContactTypesErrorMsg}); fatalError= true;} );

    if (!contacts?.some(c => c.isNew === true)) {
      this.addEmptyFormsForNewEntries(contacts);
    }

    const errors: Error[] = [];
    for (const msg of errorMessages) {
      errors.push({text: msg.text, href: msg.href});
    }

    const pageData: ContactPageData = {
      contacts: contacts,
      contactTypes: this.getContactTypesForSelect(types),
      errors: errors,
      updated: updated,
      fatalError: fatalError
    };

    res.render('courts/tabs/phoneNumbersContent', pageData);
  }
  /**
   * PUT /courts/:slug/contacts
   * validate input data and update the court contacts then re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let contacts = req.body.contacts as Contact[] ?? [];
    contacts.forEach(c => {
      c.fax = c.fax ?? false;
      c.isNew = (c.isNew === true || (c.isNew as any) === 'true');
    });

    if(!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [{text:this.updateErrorMsg}], contacts);
    }

    // Remove fully empty entries
    contacts = contacts.filter(c => !this.contactIsEmpty(c));

    const errorMsg = this.getErrorMessages(contacts);
    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, contacts);
    }

    await req.scope.cradle.api.updateContacts(req.params.slug, contacts)
        .then((value: Contact[]) => this.get(req, res, true, [], value))
        .catch(async (reason: AxiosError) => {
          const error = reason.response?.status === 409
            ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
            : this.updateErrorMsg;
          await this.get(req, res, false, [{text:error}], contacts);
        });
  }

  private getContactTypesForSelect(standardTypes: ContactType[]): SelectItem[] {
    return standardTypes.map((ct: ContactType) => (
      {value: ct.id, text: ct.type, selected: false}));
  }
  /**
   * adds an empty form so view is rendered with one blank form
   */
  private addEmptyFormsForNewEntries(contacts: Contact[], numberOfForms = 1): void {
    if (contacts) {
      for (let i = 0; i < numberOfForms; i++) {
        contacts.push({'type_id': null, number: null, fax: false, explanation: '', 'explanation_cy': '', isNew: true});
      }
    }
  }
  /**
   * check if contact is empty
   */
  private contactIsEmpty(contact: Contact): boolean {
    return (!contact.type_id && !contact.number?.trim() && !contact.explanation?.trim() && !contact.explanation_cy?.trim());
  }

  /**
   * getErrorMessages
   * @param contacts - array of Contact model
   * @return string[] - array of error messages
   */
  private getErrorMessages(numbers: Contact[]): Error[] {
    const errorMsg: Error[] = [];

    numbers.forEach((contact, index) => {

      index = index + 1;
      if (!contact.type_id) {
        errorMsg.push({text: (this.emptyDescriptionErrorMsg + index + '.'), href: '#contactDescription-' + index});
      }
      if (contact.number === '') {
        errorMsg.push({text: (this.emptyNumberErrorMsg + index + '.'), href: '#contactNumber-' + index});
      }

    })
    return errorMsg;
  };

}
