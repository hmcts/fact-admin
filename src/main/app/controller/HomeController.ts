import { Request, Response } from 'express';

export class HomeController {

  /**
   * GET /
   */
  public get(req: Request, res: Response): void {
    res.render('home');
  }

}
