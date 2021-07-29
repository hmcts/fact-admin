import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {AreaOfLaw} from '../../../types/AreaOfLaw';
import {Error} from '../../../types/Error';
import {CasesHeardPageData} from '../../../types/CasesHeardPageData';

export class CourtAreasOfLawController {

  getAreasOfLawErrorMsg = 'A problem occurred when retrieving the areas of law. ';
  getCourtAreasOfLawErrorMsg = 'A problem occurred when retrieving the court areas of law. ';

  public async get(
    req: AuthedRequest,
    res: Response,
    error = '',
    updated = false,
    areasOfLaw: AreaOfLaw[] = null,
    courtAreasOfLaw: AreaOfLaw[]): Promise<void> {
    const slug: string = req.params.slug as string;

    if (!areasOfLaw ) {
      await req.scope.cradle.api.getAreasOfLaw(slug)
        .then((value: AreaOfLaw[]) => areasOfLaw = value)
        .catch(() => error += this.getAreasOfLawErrorMsg);
    }

    if (!courtAreasOfLaw ) {
      await req.scope.cradle.api.getCourtAreasOfLaw(slug)
        .then((value: AreaOfLaw[]) => areasOfLaw = value)
        .catch(() => error += this.getCourtAreasOfLawErrorMsg);
    }

    const errors: Error[] = [];
    // If we have an error from validation when adding/removing or moving postcodes,
    // append it
    if (error) {
      errors.push({text: error});
    }

    const pageData: CasesHeardPageData = {
      areasOfLaw: areasOfLaw,
      courtAreasOfLaw: courtAreasOfLaw,
      errorMsg: errors,
      updated: updated
    };

    console.log(areasOfLaw);
    res.render('courts/tabs/casesHeardContent', pageData);
  }
}
