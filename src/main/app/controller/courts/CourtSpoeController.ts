import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Error} from '../../../types/Error';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {SpoeAreaOfLaw} from '../../../types/SpoeAreaOfLaw';
import {SpoeAreaOfLawPageData} from '../../../types/SpoeAreaOfLawPageData';

@autobind
export class CourtSpoeController {

  getSpoeAreasOfLawErrorMsg = 'A problem occurred when retrieving the spoe areas of law. ';
  getCourtSpoeAreasOfLawErrorMsg = 'A problem occurred when retrieving the court spoe areas of law. ';
  putCourtSpoeAreasOfLawErrorMsg = 'A problem occurred when updating the court spoe areas of law. ';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const updatedCourtSpoe = req.body.courtSpoeAreasOfLaw as SpoeAreaOfLaw[] ?? [];
    const allSpoeAreasOfLaw = req.body.allSpoeAreasOfLaw as SpoeAreaOfLaw[] ?? [];
    if (!CSRF.verify(req.body.csrfToken)) {
      return this.render(req, res, [this.putCourtSpoeAreasOfLawErrorMsg], false, allSpoeAreasOfLaw, updatedCourtSpoe);
    }

    await req.scope.cradle.api.updateCourtSpoeAreasOfLaw(req.params.slug, updatedCourtSpoe)
      .then(async (value: SpoeAreaOfLaw[]) =>
        await this.render(req, res, [], true, allSpoeAreasOfLaw, updatedCourtSpoe))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.putCourtSpoeAreasOfLawErrorMsg;
        await this.render(req, res, [error], false, allSpoeAreasOfLaw, updatedCourtSpoe);
      });
  }

  private async render(
    req: AuthedRequest,
    res: Response,
    errorMsg: string[] = [],
    updated = false,
    allSpoeAreasOfLaw: SpoeAreaOfLaw[] = null,
    courtSpoeAreasOfLaw: SpoeAreaOfLaw[] = null) {

    const slug: string = req.params.slug;
    let fatalError = false;
    if (!allSpoeAreasOfLaw) {
      await req.scope.cradle.api.getAllSpoeAreasOfLaw()
        .then((value: SpoeAreaOfLaw[]) => allSpoeAreasOfLaw = value)
        .catch(() => {
          errorMsg.push(this.getSpoeAreasOfLawErrorMsg);
          fatalError = true;
        });
    }

    if (!courtSpoeAreasOfLaw) {
      await req.scope.cradle.api.getCourtSpoeAreasOfLaw(slug)
        .then((value: SpoeAreaOfLaw[]) => courtSpoeAreasOfLaw = value)
        .catch(() => {
          errorMsg.push(this.getCourtSpoeAreasOfLawErrorMsg);
          fatalError = true;
        });
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: SpoeAreaOfLawPageData = {
      allSpoeAreasOfLaw: allSpoeAreasOfLaw,
      courtSpoeAreasOfLaw: courtSpoeAreasOfLaw,
      slug: slug,
      errorMsg: errors,
      updated: updated,
      fatalError: fatalError
    };

    res.render('courts/tabs/spoeContent', pageData);
  }
}
