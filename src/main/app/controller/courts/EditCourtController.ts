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
    const updated = req.body;

    const slug: string = req.params.slug as string;
    const court = await req.scope.cradle.api.getCourt(slug);

    const updatedCourt = Object.assign(court, updated);

    res.render('courts/edit-court', { court: updatedCourt });
  }
}
