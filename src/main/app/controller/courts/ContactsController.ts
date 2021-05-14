import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {SelectItem} from '../../../types/CourtPageData';
import {Contact, ContactPageData} from '../../../types/Contact';
import {ContactType} from '../../../types/ContactType';

@autobind
export class ContactsController {

  emptyTypeOrNumberErrorMsg = 'Description and number are required for all phone number entries.';
  updateErrorMsg = 'A problem occurred when saving the phone numbers.';
  getContactsErrorMsg = 'A problem occurred when retrieving the phone numbers.';
  getContactTypesErrorMsg = 'A problem occurred when retrieving the phone number types.';

  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    error = '',
    contacts: Contact[] = null): Promise<void> {

    const slug: string = req.params.slug as string;

    if (!contacts) {
      await req.scope.cradle.api.getContacts(slug)
        .then((value: Contact[]) => contacts = value)
        .catch(() => error += this.getContactsErrorMsg);
    }

    let types: ContactType[] = [];
    await req.scope.cradle.api.getContactTypes()
      .then((value: ContactType[]) => types = value)
      .catch(() => error += this.getContactTypesErrorMsg);

    const pageData: ContactPageData = {
      contacts: contacts,
      contactTypes: this.getContactTypesForSelect(types),
      errorMsg: error,
      updated: updated
    };

    res.render('courts/tabs/phoneNumbersContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const contacts = req.body.contacts as Contact[] ?? [];
    contacts.forEach(c => c.fax = c.fax ?? false);

    if (contacts.some(ot => (!ot.type_id && !ot.fax) || ot.number.trim() === '')) {
      return this.get(req, res, false, this.emptyTypeOrNumberErrorMsg, contacts);
    } else {
      await req.scope.cradle.api.updateContacts(req.params.slug, contacts)
        .then((value: Contact[]) => this.get(req, res, true, '', value))
        .catch(() => this.get(req, res, false, this.updateErrorMsg, contacts));
    }
  }

  private getContactTypesForSelect(standardTypes: ContactType[]): SelectItem[] {
    return standardTypes.map((ct: ContactType) => (
      {value: ct.id, text: ct.type, selected: false}));
  }
}
