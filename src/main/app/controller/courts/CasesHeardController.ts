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

  public async get(
    req: AuthedRequest,
    res: Response,
    error = '',
    updated = false,
    allAreasOfLaw: AreaOfLaw[] = null,
    courtAreasOfLaw: AreaOfLaw[]): Promise<void> {
    const slug: string = req.params.slug as string;
    if (!allAreasOfLaw) {
      await req.scope.cradle.api.getAllAreasOfLaw()
        .then((value: AreaOfLaw[]) => allAreasOfLaw = value)
        .catch(() => error += this.getAreasOfLawErrorMsg);
    }
    if (!courtAreasOfLaw) {
      await req.scope.cradle.api.getCourtAreasOfLaw(slug)
        .then((value: AreaOfLaw[]) => courtAreasOfLaw = value)
        .catch(() => error += this.getCourtAreasOfLawErrorMsg);
    }
    const errors: Error[] = [];
    if (error) {
      errors.push({text: error});
    }

    const pageData: CasesHeardPageData = {
      allAreasOfLaw: allAreasOfLaw,
      courtAreasOfLaw: courtAreasOfLaw,
      slug: slug,
      errorMsg: errors,
      updated: updated
    };

    res.render('courts/tabs/casesHeardContent', pageData);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const updatedCasesHeard = req.body.courtAreasOfLaw as AreaOfLaw[] ?? [];
    const allAreasOfLaw = req.body.allAreasOfLaw as AreaOfLaw[] ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.get(req, res, this.putCourtAreasOfLawErrorMsg, false, allAreasOfLaw, updatedCasesHeard);
    }

    // Send the new postcodes to fact-api to add them to the database
    await req.scope.cradle.api.updateCourtAreasOfLaw(req.params.slug, updatedCasesHeard)
      .then(async (value: AreaOfLaw[]) =>
        await this.get(req, res, '', true, allAreasOfLaw, updatedCasesHeard))
      .catch(async (reason: AxiosError) => {
        await this.get(req, res, this.putCourtAreasOfLawErrorMsg, false, allAreasOfLaw, updatedCasesHeard);
      });
  }
}
