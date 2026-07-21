import config from 'config';
import {Request, Response} from 'express';

export class ServiceUnavailableController {

  /**
   * GET /use-new-service
   * Explains that non-super-admin users must use the replacement service.
   */
  public get(req: Request, res: Response): void {
    res.render('service-unavailable', {
      newAdminUrl: config.get('services.newAdmin.url'),
      retiredServicePage: true
    });
  }
}
