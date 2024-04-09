import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {ContactType} from '../../../types/ContactType';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';

@autobind
export class ContactTypesController {

  editContactTypeUrl = 'lists/contact-type/';
  deleteContactTypeUrl = 'lists/contact-type/';
  deleteConfirmUrl = 'lists/contact-type/delete-confirm/';

  getContactTypesError = 'An error occurred when retrieving the contact types.';
  getContactTypeError = 'A problem occurred when retrieving the contact type.';
  updateContactTypeError = 'A problem occurred when trying to save the contact type.';
  contactTypeAlreadyExistsError = 'A contact type with the proposed name already exists. The name must be unique.';
  deleteError = 'A problem occurred when trying to delete the contact type.';
  contactTypeInUseError = 'You cannot delete this contact type at the moment, as one or more courts are dependent on it. ' +
    'Please remove the contact type from the relevant courts first';
  nameRequiredError = 'Name is required.';
  /**
   * GET /lists/contact-types
   * render the view with all contact types list
   */
  public async getAll(req: AuthedRequest, res: Response): Promise<void> {
    await this.renderAll(req, res);
  }
  /**
   * GET /lists/contact-type/:id or /lists/contact-type
   * get the data for a specific contact type and render the view
   */
  public async getContactType(req: AuthedRequest, res: Response): Promise<void> {
    const errors: { text: string }[] = [];
    const id = req.params?.id;
    let fatalError = false;

    let contactType: ContactType = null;
    if (id) {
      await req.scope.cradle.api.getContactType(id)
        .then((value: ContactType) => contactType = value )
        .catch(() => {
          errors.push({ text: this.getContactTypeError });
          fatalError = true;
        });
    }

    this.renderContactType(res, contactType, false, errors, fatalError);
  }

  /**
   * PUT /lists/contact-type
   * validate input data and update the contact type and re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let contactType = req.body.contactType as ContactType;

    if(!CSRF.verify(req.body._csrf)) {
      this.renderContactType(res, contactType, false, [{ text: this.updateContactTypeError }]);
      return;
    }

    contactType = this.sanitizeContactType(contactType);

    const validationResult = this.validateContactType(contactType);
    if (validationResult.errors?.length === 0) {
      const api = contactType.id
        ? (ct: ContactType): Promise<ContactType> => req.scope.cradle.api.updateContactType(ct)
        : (ct: ContactType): Promise<ContactType> => req.scope.cradle.api.createContactType(ct);

      await api(contactType)
        .then(async () => await this.renderAll(req, res, true))
        .catch((reason: AxiosError) => {
          const error = reason.response?.status === 409
            ? this.contactTypeAlreadyExistsError
            : this.updateContactTypeError;
          this.renderContactType(res, contactType, false, [{text: error }]);
        });

    } else {
      this.renderContactType(res, contactType, false, validationResult.errors, false, validationResult.nameValid);
    }
  }

  public async getDeleteConfirmation(req: AuthedRequest, res: Response): Promise<void> {
    const idToDelete = req.params.id;
    const name = req.query?.type?.toString();
    this.renderDeleteConfirmation(res, name, idToDelete);
  }
  /**
   * DELETE /lists/contact-type/:id
   * delete the contact type and re-render the main view
   */
  public async delete(req: AuthedRequest, res: Response): Promise<void> {
    const idToDelete = req.params.id;

    await req.scope.cradle.api.deleteContactType(idToDelete)
      .then(() => this.renderAll(req, res, true))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.contactTypeInUseError
          : this.deleteError;
        await this.renderAll(req, res, false, [{text: error}]);
      });
  }

  private async renderAll(req: AuthedRequest, res: Response, updated = false, errors: { text: string }[] = []): Promise<void> {
    let contactTypes: ContactType[] = [];
    await req.scope.cradle.api.getContactTypes()
      .then((value: ContactType[]) => contactTypes = value)
      .catch(() => errors.push({ text: this.getContactTypesError }));

    const pageData = {
      errors: errors,
      updated: updated,
      contactTypes: contactTypes?.sort((a, b) => a.type.localeCompare(b.type)),
      editUrl: this.editContactTypeUrl,
      deleteUrl: this.deleteConfirmUrl
    };
    res.render('lists/tabs/contactTypes/contactTypeContent', pageData);
  }

  private renderContactType(
    res: Response,
    contactType: ContactType,
    updated: boolean,
    errorMsgs: { text: string }[] = [],
    fatalError = false,
    nameValid = true): void {

    const pageData = {
      contactType: contactType,
      updated: updated,
      errors: errorMsgs,
      nameValid: nameValid,
      fatalError: fatalError
    };
    res.render('lists/tabs/contactTypes/editContactType', pageData);
  }

  private validateContactType(contactType: ContactType):
    { nameValid: boolean; errors: { text: string }[]} {
    let nameValid = true;
    const validationErrors: { text: string }[] = [];

    if (!contactType.type?.trim()) {
      nameValid = false;
      validationErrors.push({ text: this.nameRequiredError });
    }

    return { nameValid: nameValid, errors: validationErrors};
  }

  private renderDeleteConfirmation(res: Response, contactTypeName: string, contactTypeId: string): void {
    const deleteUrl = this.deleteContactTypeUrl + contactTypeId;
    const pageData = {
      name: contactTypeName,
      deleteUrl: deleteUrl
    };
    res.render('lists/tabs/contactTypes/deleteContactTypeConfirm', pageData);
  }

  public sanitizeContactType(contactType: ContactType): ContactType {
    contactType['type'] = this.sanitizeInput(contactType.type);
    contactType['type_cy'] = this.sanitizeInput(contactType.type_cy);

    return contactType;
  }
  /**
   * sanitize all input before saving
   */
  private sanitizeInput(input: string): string {
    return input?.trim() || null;
  }


}
