import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {Error} from '../../../types/Error';
import {CasesHeardPageData} from '../../../types/CasesHeardPageData';

export class CasesHeardController {

  getAreasOfLawErrorMsg = 'A problem occurred when retrieving the areas of law. ';
  getCourtAreasOfLawErrorMsg = 'A problem occurred when retrieving the court areas of law. ';

  public async get(
    req: AuthedRequest,
    res: Response,
    error = '',
    updated = false,
    allAreasOfLaw: AreaOfLaw[] = null,
    courtAreasOfLaw: AreaOfLaw[]): Promise<void> {
    const slug: string = req.params.slug as string;

    if (!allAreasOfLaw ) {
      await req.scope.cradle.api.getAreasOfLaw()
        .then((value: AreaOfLaw[]) => allAreasOfLaw = value)
        .catch(() => error += this.getAreasOfLawErrorMsg);
    }

    if (!courtAreasOfLaw ) {
      await req.scope.cradle.api.getCourtAreasOfLaw(slug)
        .then((value: AreaOfLaw[]) => courtAreasOfLaw = value)
        .catch(() => error += this.getCourtAreasOfLawErrorMsg);
    }

    const errors: Error[] = [];
    if (error) {
      errors.push({text: error});
    }

    console.log(errors);

    const pageData: CasesHeardPageData = {
      allAreasOfLaw: allAreasOfLaw,
      courtAreasOfLaw: courtAreasOfLaw,
      errorMsg: errors,
      updated: updated
    };

    res.render('courts/tabs/casesHeardContent', pageData);
  }
}
