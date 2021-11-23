import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {OpeningType} from '../../../types/OpeningType';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';

@autobind
export class OpeningTypesController {
  editBaseUrl = 'lists/opening-type/';
  deleteBaseUrl = 'lists/opening-type/';
  deleteConfirmBaseUrl = 'lists/opening-types/delete-confirm/';
  getOpeningsError = 'An error occurred when retrieving the opening types list.';
  getOpeningError = 'An error occurred when retrieving the opening type data.';
  updateOpeningError = 'An error occurred when trying to save the opening type data.';
  deleteOpeningTypeError = 'An error occurred when trying to delete the opening type.';
  nameRequiredError = 'The name is required.';
  nameDuplicatedError = 'A opening type with the same name already exists.';
  openingTypeInUseError = 'You cannot delete this opening type at the moment, as one or more courts are dependent on it. ' +
    'Please remove the opening from the relevant courts first.';

  public async getAll(req: AuthedRequest, res: Response): Promise<void> {
    await this.renderAll(req, res);
  }

  public async getOpeningType(req: AuthedRequest, res: Response): Promise<void> {
    const errors: { text: string }[] = [];
    const id = req.params?.id;
    let fatalError = false;

    let openingType: OpeningType = null;
    if (id) {
      await req.scope.cradle.api.getOpeningType(id)
        .then((value: OpeningType) => openingType = value )
        .catch(() => {
          errors.push({ text: this.getOpeningsError });
          fatalError = true;
        });
    }

    this.renderOpeningType(res, openingType, false, errors, true, fatalError);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let openingType = req.body.openingType as OpeningType;

    if(!CSRF.verify(req.body._csrf)) {
      this.renderOpeningType(res, openingType, false, [{ text: this.updateOpeningError }]);
      return;
    }
    openingType = this.sanitizeOpeningType(openingType);

    if(!openingType.type) {
      this.renderOpeningType(res, openingType, false, [{ text: this.nameRequiredError }], false);
      return;
    }

    const api = openingType.id
      ? (o: OpeningType): Promise<OpeningType> => req.scope.cradle.api.updateOpeningType(o)
      : (o: OpeningType): Promise<OpeningType> => req.scope.cradle.api.createOpeningType(o);

    await api(openingType)
      .then(async () => await this.renderAll(req, res, true))
      .catch((reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.nameDuplicatedError
          : this.updateOpeningError;
        this.renderOpeningType(res, openingType, false, [{text: error }]);
      });
  }

  public async delete(req: AuthedRequest, res: Response): Promise<void> {

    const idToDelete = req.params.id;
    await req.scope.cradle.api.deleteOpeningType(idToDelete)
      .then(() => this.renderAll(req, res, true))
      .catch((reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.openingTypeInUseError
          : this.deleteOpeningTypeError;
        this.renderAll(req, res, false, [{ text: error }]);
      });
  }

  public async getDeleteConfirmation(req: AuthedRequest, res: Response): Promise<void> {
    const idToDelete = req.params.id;
    const name = req.query?.type?.toString();
    this.renderDeleteConfirmation(res, idToDelete, name);
  }


  private async renderAll(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errors: { text: string }[] = []): Promise<void> {

    let openingTypes: OpeningType[] = [];
    await req.scope.cradle.api.getOpeningTimeTypes()
      .then((value: OpeningType[]) => openingTypes = value)
      .catch(() => errors.push({ text: this.getOpeningsError }));

    const sortByOrder = (f: OpeningType[]) => f.sort((a, b) => a?.type > b?.type ? 1 : -1 );

    const pageData = {
      errors: errors,
      updated: updated,
      openingTypes: sortByOrder(openingTypes),
      editBaseUrl: this.editBaseUrl,
      deleteConfirmBaseUrl: this.deleteConfirmBaseUrl
    };

    res.render('lists/tabs/openingTypes/openingTypesContent', pageData);
  }

  private renderOpeningType(
    res: Response,
    openingType: OpeningType,
    updated = false,
    errors: { text: string }[] = [],
    nameValid = true,
    fatalError = false) {

    const pageData = {
      openingType: openingType,
      updated: updated,
      errors: errors,
      nameValid: nameValid,
      fatalError: fatalError
    };
    res.render('lists/tabs/openingTypes/editOpeningType', pageData);
  }

  private renderDeleteConfirmation(res: Response, openingTypeId: string, openingTypeName: string): void {
    const deleteUrl = this.deleteBaseUrl + openingTypeId;
    const pageData = {
      name: openingTypeName,
      deleteUrl: deleteUrl
    };
    res.render('lists/tabs/openingTypes/deleteOpeningTypeConfirm', pageData);
  }

  public sanitizeOpeningType(openingType: OpeningType): OpeningType {
    openingType['type'] = this.sanitizeInput(openingType.type);
    openingType['type_cy'] = this.sanitizeInput(openingType.type_cy);

    return openingType;
  }

  private sanitizeInput(input: string): string {
    return input?.trim() || null;
  }



}
