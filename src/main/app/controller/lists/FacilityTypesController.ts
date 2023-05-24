import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {Facility, FacilityType} from '../../../types/Facility';

@autobind
export class FacilityTypesController {

  editBaseUrl = 'lists/facility-type/';
  deleteBaseUrl = 'lists/facility-types/';
  deleteConfirmBaseUrl = 'lists/facility-types/delete-confirm/';

  getFacilitiesError = 'An error occurred when retrieving the facility types list.';
  getFacilityError = 'An error occurred when retrieving the facility type data.';
  updateFacilityError = 'An error occurred when trying to save the facility type data.';
  deleteFacilityTypeError = 'An error occurred when trying to delete the facility type.';
  nameRequiredError = 'The name is required.';
  nameDuplicatedError = 'A facility type with the same name already exists.';
  facilityTypeInUseError = 'You cannot delete this facility type at the moment, as one or more courts are dependent on it. ' +
    'Please remove the facility from the relevant courts first.';
  reorderError = 'An error occurred when trying to reorder the facility types.';
  /**
   * GET /lists/facility-types
   * render the view with all facility types
   */
  public async getAll(req: AuthedRequest, res: Response): Promise<void> {
    await this.renderAll(req, res);
  }

  public async getAllReorder(req: AuthedRequest, res: Response): Promise<void> {
    await this.renderAll(req, res, false, [], false);
  }
  /**
   * GET /lists/facility-type/:id or /lists/facility-type
   * get the data for a specific facility and render the view
   */
  public async getFacilityType(req: AuthedRequest, res: Response): Promise<void> {
    const errors: { text: string }[] = [];
    const id = req.params?.id;
    let fatalError = false;

    let facilityType: FacilityType = null;
    if (id) {
      await req.scope.cradle.api.getFacilityType(id)
        .then((value: FacilityType) => facilityType = value )
        .catch(() => {
          errors.push({ text: this.getFacilityError });
          fatalError = true;
        });
    }

    this.renderFacilityType(res, facilityType, false, errors, true, fatalError);
  }
  /**
   * PUT /lists/facility-type
   * validate input data and update the facility type and re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const facilityType = req.body.facilityType;

    if(!CSRF.verify(req.body._csrf)) {
      this.renderFacilityType(res, facilityType, false, [{ text: this.updateFacilityError }]);
      return;
    }

    if(!facilityType.name) {
      this.renderFacilityType(res, facilityType, false, [{ text: this.nameRequiredError }], false);
      return;
    }

    const api = facilityType.id
      ? (f: Facility): Promise<FacilityType> => req.scope.cradle.api.updateFacilityType(f)
      : (f: Facility): Promise<FacilityType> => req.scope.cradle.api.createFacilityType(f);

    await api(facilityType)
      .then(async () => await this.renderAll(req, res, true))
      .catch((reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.nameDuplicatedError
          : this.updateFacilityError;
        this.renderFacilityType(res, facilityType, false, [{text: error }]);
      });
  }

  public async reorder(req: AuthedRequest, res: Response): Promise<void> {
    const idsInOrder = req.body.facilityIds;

    if(!CSRF.verify(req.body._csrf)) {
      await this.renderAll(req, res, false, [{ text: this.reorderError}], false);
      return;
    }

    await req.scope.cradle.api.reorderFacilityTypes(idsInOrder)
      .then(() => this.renderAll(req, res, true))
      .catch((reason: AxiosError) =>
        this.renderAll(req, res, false, [{ text: this.reorderError }], false)
      );
  }
  /**
   * DELETE /lists/facility-types/:id
   * delete the facility type and re-render the main view
   */
  public async delete(req: AuthedRequest, res: Response): Promise<void> {
    if(!CSRF.verify(req.body._csrf)) {
      await this.renderAll(req, res, false, [{ text: this.deleteFacilityTypeError}]);
      return;
    }

    const idToDelete = req.params.id;
    await req.scope.cradle.api.deleteFacilityType(idToDelete)
      .then(() => this.renderAll(req, res, true))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.facilityTypeInUseError
          : this.deleteFacilityTypeError;
        await this.renderAll(req, res, false, [{text: error}]);
      });
  }
  /**
   * GET /lists/facility-types/delete-confirm/:id
   * render the confirmation view
   */
  public async getDeleteConfirmation(req: AuthedRequest, res: Response): Promise<void> {
    const idToDelete = req.params.id;
    const name = req.query?.name?.toString();
    this.renderDeleteConfirmation(res, idToDelete, name);
  }

  private async renderAll(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errors: { text: string }[] = [],
    editMode = true): Promise<void> {

    let facilityTypes: FacilityType[] = [];
    await req.scope.cradle.api.getFacilityTypes()
      .then((value: FacilityType[]) => facilityTypes = value)
      .catch(() => errors.push({ text: this.getFacilitiesError }));

    const sortByOrder = (f: FacilityType[]) => f.sort((a, b) => a?.order > b?.order ? 1 : -1 );

    const pageData = {
      errors: errors,
      updated: updated,
      facilityTypes: sortByOrder(facilityTypes),
      editBaseUrl: this.editBaseUrl,
      deleteConfirmBaseUrl: this.deleteConfirmBaseUrl,
      editMode: editMode
    };

    res.render('lists/tabs/facilityTypesContent', pageData);
  }

  private renderFacilityType(
    res: Response,
    facilityType: FacilityType,
    updated = false,
    errors: { text: string }[] = [],
    nameValid = true,
    fatalError = false) {

    const pageData = {
      facilityType: facilityType,
      updated: updated,
      errors: errors,
      nameValid: nameValid,
      fatalError: fatalError
    };
    res.render('lists/tabs/editFacilityType', pageData);
  }

  private renderDeleteConfirmation(res: Response, facilityTypeId: string, facilityTypeName: string): void {
    const deleteUrl = this.deleteBaseUrl + facilityTypeId;
    const pageData = {
      name: facilityTypeName,
      deleteUrl: deleteUrl
    };
    res.render('lists/tabs/deleteFacilityTypeConfirm', pageData);
  }
}
