import { Response } from 'express';
import autobind from 'autobind-decorator';
import { AuthedRequest } from '../../../types/AuthedRequest';

@autobind
export class EditCourtGeneralController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    const slug: string = req.params.slug as string;
    const court = await req.scope.cradle.api.getCourtGeneral(slug);

    res.render('courts/edit-court-general', { court });
  }

  public async post(req: AuthedRequest, res: Response): Promise<void> {
    const currentCourt = {
      name: req.body.name,
      'urgent_message': req.body.currentUrgent,
      'urgent_message_cy': req.body.currentUrgentCy
    };
    const newCourt = {
      name: req.body.name,
      'urgent_message': req.body['urgent_message'],
      'urgent_message_cy': req.body['urgent_message_cy']
    };
    if (JSON.stringify(currentCourt) !== JSON.stringify(newCourt)){
      const slug: string = req.params.slug as string;
      const updateCourt = await req.scope.cradle.api.updateCourtGeneral(slug, newCourt);

      return res.render('courts/edit-court-general', { court: updateCourt, updated: true });
    }
    return res.render('courts/edit-court-general', { court: currentCourt, updated: false });
  }
}
