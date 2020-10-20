import { Response } from 'express';
import { I18nRequest } from '../../types/I18nRequest';
import { Logger } from '../../types/Logger';

export class ErrorController {

  constructor(
    private readonly logger: Logger,
    private readonly exposeErrors: boolean
  ) { }

  /**
   * Catch all for 404
   */
  public notFound(req: I18nRequest, res: Response): void {
    res.status(404);
    res.render('not-found', req.i18n.getDataByLanguage(req.lng)['not-found']);
  }

  /**
   * Catch all for 500 errors
   */
  public internalServerError(err: HTTPError, req: I18nRequest, res: Response): void {
    this.logger.error(`${err.stack || err}`);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = this.exposeErrors ? err : {};
    res.status(err.status || 500);
    res.render('error', req.i18n.getDataByLanguage(req.lng).error);
  }

}

export class HTTPError extends Error {
  status: number;
}
