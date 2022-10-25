import autobind from 'autobind-decorator';
import {Response} from 'express';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Region} from '../../../types/Region';
import {SelectItem} from '../../../types/CourtPageData';

@autobind
export class CourtsController {

  /**
   * GET /courts and /regions
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {

    const courts = await req.scope.cradle.api.getCourts();
    console.log(courts);
    const regions = req.scope.cradle.api.getRegions();
    const regionsSelect = this.getRegionsForSelect(regions);

    res.render('courts/courts', { courts, regionsSelect });
  }

  public getRegionsForSelect(regions: Region[]): SelectItem[] {
    return regions.map((rg: Region) => (
      {value: rg.id, text: rg.name, selected: false}));
  }
}
