import { Response } from 'express';
import { AuthedRequest } from '../../../types/AuthedRequest';

export class BulkUpdateController {

  /**
   * GET /bulk-update
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const courts = await req.scope.cradle.api.getCourts();

    res.render('bulk-update/index', { courts });
  }

  public async post(req: AuthedRequest, res: Response): Promise<void> {
    const courts = await req.scope.cradle.api.getCourts();

    res.render('bulk-update/index', { courts });
  }
}
