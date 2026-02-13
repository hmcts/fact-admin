import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';

export class ListsController {
  /**
   * GET /lists
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    res.render('lists/index', {
      activeListsPage: true,
    });
  }
}
