import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {validateUrlFormat} from '../../../utils/validation';

@autobind
export class AreasOfLawController {

  editAreaOfLawUrl = 'lists/area-of-law/';
  deleteAreaOfLawUrl = 'lists/area-of-law/';
  deleteConfirmUrl = 'lists/area-of-law/delete-confirm/';

  getAreasOfLawError = 'An error occurred when retrieving the areas of law.';
  getAreaOfLawError = 'A problem occurred when retrieving the area of law.';
  updateAreaOfLawError = 'A problem occurred when trying to save the area of law.';
  areaOfLawAlreadyExistsError = 'An area of law with the proposed name already exists. The name must be unique.';
  deleteError = 'A problem occurred when trying to delete the area of law.';
  areaOfLawInUseError = 'You cannot delete this area of law at the moment, as one or more courts are dependent on it. ' +
    'Please remove the area of law from the relevant courts first';
  nameRequiredError = 'Name is required.';
  externalLinkInvalidError = 'External Link URL is invalid.';
  dispExternalLinkInvalidError = 'Display External Link URL is invalid.';
  /**
   * GET /lists/areas-of-law
   * render the view with all area of law list
   */
  public async getAll(req: AuthedRequest, res: Response): Promise<void> {
    await this.renderAll(req, res);
  }
  /**
   * GET /lists/area-of-law/:id
   * get the data for a specific area of law and render the view
   */
  public async getAreaOfLaw(req: AuthedRequest, res: Response): Promise<void> {
    const errors: { text: string }[] = [];
    const id = req.params?.id;
    let fatalError = false;

    let areaOfLaw: AreaOfLaw = null;
    if (id) {
      await req.scope.cradle.api.getAreaOfLaw(id)
        .then((value: AreaOfLaw) => areaOfLaw = value )
        .catch(() => {
          errors.push({ text: this.getAreaOfLawError });
          fatalError = true;
        });
    }
    this.renderAreaOfLaw(res, areaOfLaw, false, errors, fatalError);
  }
  /**
   * GET /lists/area-of-law/delete-confirm/:id
   * render the view for deletion of the specific area of law
   */
  public async getDeleteConfirmation(req: AuthedRequest, res: Response): Promise<void> {
    const idToDelete = req.params.id;
    const name = req.query?.name?.toString();
    this.renderDeleteConfirmation(res, name, idToDelete);
  }
  /**
   * PUT /lists/area-of-law
   * validate input data and update the area of law lists and re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let areaOfLaw = req.body.areaOfLaw as AreaOfLaw;

    if(!CSRF.verify(req.body._csrf)) {
      this.renderAreaOfLaw(res, areaOfLaw, false, [{ text: this.updateAreaOfLawError }]);
      return;
    }

    areaOfLaw = this.sanitizeAreaOfLaw(areaOfLaw);

    const validationResult = this.validateAreaOfLaw(areaOfLaw);
    if (validationResult.errors?.length === 0) {
      const api = areaOfLaw.id
        ? (aol: AreaOfLaw): Promise<AreaOfLaw> => req.scope.cradle.api.updateAreaOfLaw(aol)
        : (aol: AreaOfLaw): Promise<AreaOfLaw> => req.scope.cradle.api.createAreaOfLaw(aol);

      await api(areaOfLaw)
        .then(async () => await this.renderAll(req, res, true))
        .catch((reason: AxiosError) => {
          const error = reason.response?.status === 409
            ? this.areaOfLawAlreadyExistsError
            : this.updateAreaOfLawError;
          this.renderAreaOfLaw(res, areaOfLaw, false, [{text: error }]);
        });

    } else {
      this.renderAreaOfLaw(res, areaOfLaw, false, validationResult.errors, false, validationResult.nameValid,
        validationResult.linkValid, validationResult.displayLinkValid);
    }
  }
  /**
   * DELETE /lists/area-of-law/:id
   * delete the area of law  and re-render the main view
   */
  public async delete(req: AuthedRequest, res: Response): Promise<void> {
    const idToDelete = req.params.id;

    await req.scope.cradle.api.deleteAreaOfLaw(idToDelete)
      .then(() => this.renderAll(req, res, true))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.areaOfLawInUseError
          : this.deleteError;
        await this.renderAll(req, res, false, [{ text: error }]);
      });
  }

  private async renderAll(req: AuthedRequest, res: Response, updated = false, errors: { text: string }[] = []): Promise<void> {
    let areasOfLaw: AreaOfLaw[] = [];
    await req.scope.cradle.api.getAreasOfLaw()
      .then((value: AreaOfLaw[]) => areasOfLaw = value)
      .catch(() => errors.push({ text: this.getAreasOfLawError }));

    const pageData = {
      errors: errors,
      updated: updated,
      areasOfLaw: areasOfLaw?.sort((a, b) => a.name.localeCompare(b.name)),
      editUrl: this.editAreaOfLawUrl,
      deleteUrl: this.deleteConfirmUrl
    };
    res.render('lists/tabs/areasOfLawContent', pageData);
  }

  private renderAreaOfLaw(
    res: Response,
    areaOfLaw: AreaOfLaw,
    updated: boolean,
    errorMsgs: { text: string }[] = [],
    fatalError = false,
    nameValid = true,
    linkValid = true,
    displayLinkValid = true): void {

    const pageData = {
      areaOfLaw: areaOfLaw,
      updated: updated,
      errors: errorMsgs,
      nameValid: nameValid,
      linkValid: linkValid,
      displayLinkValid: displayLinkValid,
      fatalError: fatalError
    };
    res.render('lists/tabs/editAreaOfLaw', pageData);
  }

  private renderDeleteConfirmation(res: Response, areaOfLawName: string, areaOfLawId: string): void {
    const deleteUrl = this.deleteAreaOfLawUrl + areaOfLawId;
    const pageData = {
      name: areaOfLawName,
      deleteUrl: deleteUrl
    };
    res.render('lists/tabs/deleteAreaOfLawConfirm', pageData);
  }

  private validateAreaOfLaw(areaOfLaw: AreaOfLaw):
    { nameValid: boolean; linkValid: boolean; displayLinkValid: boolean; errors: { text: string }[]} {
    let nameValid = true;
    let linkValid = true;
    let displayLinkValid = true;
    const validationErrors: { text: string }[] = [];

    if (!areaOfLaw.name?.trim()) {
      nameValid = false;
      validationErrors.push({ text: this.nameRequiredError });
    }
    if(areaOfLaw.external_link && !validateUrlFormat(areaOfLaw.external_link)) {
      linkValid = false;
      validationErrors.push({ text: this.externalLinkInvalidError });
    }
    if(areaOfLaw.display_external_link && !validateUrlFormat(areaOfLaw.display_external_link)) {
      displayLinkValid = false;
      validationErrors.push({ text: this.dispExternalLinkInvalidError });
    }

    return { nameValid: nameValid, linkValid: linkValid, displayLinkValid: displayLinkValid, errors: validationErrors };
  }

  sanitizeAreaOfLaw(areaOfLaw: AreaOfLaw): AreaOfLaw {
    areaOfLaw['alt_name'] = this.sanitizeInput(areaOfLaw.alt_name);
    areaOfLaw['alt_name_cy'] = this.sanitizeInput(areaOfLaw.alt_name_cy);
    areaOfLaw['external_link'] = this.sanitizeInput(areaOfLaw.external_link);
    areaOfLaw['external_link_desc'] = this.sanitizeInput(areaOfLaw.external_link_desc);
    areaOfLaw['external_link_desc_cy'] = this.sanitizeInput(areaOfLaw.external_link_desc_cy);
    areaOfLaw['display_external_link'] = this.sanitizeInput(areaOfLaw.display_external_link);
    areaOfLaw['display_name'] = this.sanitizeInput(areaOfLaw.display_name);
    areaOfLaw['display_name_cy'] = this.sanitizeInput(areaOfLaw.display_name_cy);

    return areaOfLaw;
  }

  /**
   * sanitize all input before saving
   */
  private sanitizeInput(input: string): string {
    return input?.trim() || null;
  }
}
