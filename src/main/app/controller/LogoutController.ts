import { AuthedRequest } from '../../types/AuthedRequest';
import { Response } from 'express';

export class LogoutController {

  /**
   * GET /logout
   * Handles the logout process, including removing court locks before logout.
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    // Remove the court lock
    await req.scope.cradle.api.deleteCourtLocksByEmail(req.appSession['user']['jwt']['sub']);

    // Perform the actual logout
    await res.oidc.logout();
  }
}
