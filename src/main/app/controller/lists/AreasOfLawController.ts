import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {urlIsValid} from '../../../utils/validation';

@autobind
export class AreasOfLawController {

  editAreaOfLawUrl = 'lists/area-of-law/';
  getAreasOfLawError = 'An error occurred when retrieving the areas of law.';
  getAreaOfLawError = 'A problem occurred when retrieving the area of law.';
  updateAreaOfLawError = 'A problem occurred when trying to save the area of law.';
  areaOfLawAlreadyExistsError = 'An area of law with the proposed name already exists. The name must be unique.';
  nameRequiredError = 'Name is required.';
  externalLinkInvalidError = 'External Link URL is invalid.';
  dispExternalLinkInvalidError = 'Display External Link URL is invalid.';

  public async getAll(req: AuthedRequest, res: Response, updated = false): Promise<void> {
    const errors: { text: string }[] = [];

    let areasOfLaw: AreaOfLaw[] = [];
    await req.scope.cradle.api.getAreasOfLaw()
      .then((value: AreaOfLaw[]) => areasOfLaw = value)
      .catch(() => errors.push({ text: this.getAreasOfLawError }));

    const pageData = {
      errors: errors,
      updated: updated,
      areasOfLaw: areasOfLaw?.sort((a, b) => a.name.localeCompare(b.name)),
      editUrl: this.editAreaOfLawUrl
    };
    res.render('lists/tabs/areasOfLawContent', pageData);
  }

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
        .then(async () => await this.getAll(req, res, true))
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
    if(areaOfLaw.external_link && !urlIsValid(areaOfLaw.external_link)) {
      linkValid = false;
      validationErrors.push({ text: this.externalLinkInvalidError });
    }
    if(areaOfLaw.display_external_link && !urlIsValid(areaOfLaw.display_external_link)) {
      displayLinkValid = false;
      validationErrors.push({ text: this.dispExternalLinkInvalidError });
    }

    return { nameValid: nameValid, linkValid: linkValid, displayLinkValid: displayLinkValid, errors: validationErrors };
  }

  sanitizeAreaOfLaw(areaOfLaw: AreaOfLaw): AreaOfLaw {
    areaOfLaw['alt_name'] = areaOfLaw.alt_name?.trim() || null;
    areaOfLaw['alt_name_cy'] = areaOfLaw.alt_name_cy?.trim() || null;
    areaOfLaw['external_link'] = areaOfLaw.external_link?.trim() || null;
    areaOfLaw['external_link_desc'] = areaOfLaw.external_link_desc?.trim() || null;
    areaOfLaw['external_link_desc_cy'] = areaOfLaw.external_link_desc_cy?.trim() || null;
    areaOfLaw['display_external_link'] = areaOfLaw.display_external_link?.trim() || null;
    areaOfLaw['display_name'] = areaOfLaw.display_name?.trim() || null;
    areaOfLaw['display_name_cy'] = areaOfLaw.display_name_cy?.trim() || null;

    return areaOfLaw;
  }
}
