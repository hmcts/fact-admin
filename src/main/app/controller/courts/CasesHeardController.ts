import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {Error} from '../../../types/Error';
import {CasesHeardPageData} from '../../../types/CasesHeardPageData';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';

@autobind
export class CasesHeardController {

  getAreasOfLawErrorMsg = 'A problem occurred when retrieving the areas of law. ';
  getCourtAreasOfLawErrorMsg = 'A problem occurred when retrieving the court areas of law. ';
  putCourtAreasOfLawErrorMsg = 'A problem occurred when updating the court areas of law. ';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const updatedCasesHeard = req.body.courtAreasOfLaw as AreaOfLaw[] ?? [];
    const allAreasOfLaw = req.body.allAreasOfLaw as AreaOfLaw[] ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.render(req, res, [this.putCourtAreasOfLawErrorMsg], false, allAreasOfLaw, updatedCasesHeard);
    }

    await req.scope.cradle.api.updateCourtAreasOfLaw(req.params.slug, updatedCasesHeard)
      .then(async (value: AreaOfLaw[]) =>
        await this.render(req, res, [], true, allAreasOfLaw, updatedCasesHeard))
      .catch(async (reason: AxiosError) => {
        await this.render(req, res, [this.putCourtAreasOfLawErrorMsg], false, allAreasOfLaw, updatedCasesHeard);
      });
  }

  private async render(
    req: AuthedRequest,
    res: Response,
    errorMsg: string[] = [],
    updated = false,
    allAreasOfLaw: AreaOfLaw[] = null,
    courtAreasOfLaw: AreaOfLaw[] = null) {

    const slug: string = req.params.slug;
    let fatalError = false;
    if (!allAreasOfLaw) {
      await req.scope.cradle.api.getAllAreasOfLaw()
        .then((value: AreaOfLaw[]) => allAreasOfLaw = value)
        .catch(() => {
          errorMsg.push(this.getAreasOfLawErrorMsg);
          fatalError = true;
        });
    }

    if (!courtAreasOfLaw) {
      await req.scope.cradle.api.getCourtAreasOfLaw(slug)
        .then((value: AreaOfLaw[]) => courtAreasOfLaw = value)
        .catch(() => {
          errorMsg.push(this.getCourtAreasOfLawErrorMsg);
          fatalError = true;
        });
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: CasesHeardPageData = {
      allAreasOfLaw: allAreasOfLaw,
      courtAreasOfLaw: courtAreasOfLaw,
      slug: slug,
      errorMsg: errors,
      updated: updated,
      fatalError: fatalError
    };

    res.render('courts/tabs/casesHeardContent', pageData);
  }
}
