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

  /**
   * POST /bulk-update
   */
  public async post(req: AuthedRequest, res: Response): Promise<void> {
    let error = '';

    if (req.body.courts && req.body.courts.length > 0) {
      try {
        await req.scope.cradle.api.updateCourtsInfo({
          'info': req.body.info_message,
          'info_cy': req.body.info_message_cy,
          'courts': typeof req.body.courts === 'string' ? [req.body.courts] : req.body.courts
        });
      } catch (err) {
        error = 'There was an error updating the court information.';
      }
    } else {
      error = 'Please select one or more courts to update.';
    }

    const courts = await req.scope.cradle.api.getCourts();

    res.render('bulk-update/index', { courts, error, updated: !error });
  }
}
