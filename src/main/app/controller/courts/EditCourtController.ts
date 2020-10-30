import { Response } from 'express';
import autobind from 'autobind-decorator';
import { AuthedRequest } from '../../../types/AuthedRequest';

@autobind
export class EditCourtController {

  public async get(req: AuthedRequest, res: Response) {
    const slug: string = req.params.slug as string;
    const court = await req.scope.cradle.api.getCourt(slug);

    return res.render('courts/edit-court', court);
  }
}
