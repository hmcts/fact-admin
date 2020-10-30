import { Response } from 'express';
import autobind from 'autobind-decorator';
import { AuthedRequest } from '../../../types/AuthedRequest';

@autobind
export class EditCourtController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const slug: string = req.params.slug as string;
    const court = await req.scope.cradle.api.getCourt(slug);

    res.render('courts/edit-court', { court });
  }

  public async post(req: AuthedRequest, res: Response): Promise<void> {
    const slug: string = req.params.slug as string;
    const updated: {} = req.body;
    const updateCourt = await req.scope.cradle.api.updateCourt(slug, updated);

    res.render('courts/edit-court', { court: updateCourt, updated: true });
  }
}
