import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Audit, AuditPageData} from '../../../types/Audit';
import {Court} from '../../../types/Court';

@autobind
export class AuditController {

  getAuditsErrorMsg = 'A problem occurred when retrieving the audit data.';
  getCourtsErrorMsg = 'A problem occurred when retrieving the courts data.';

  public async get(req: AuthedRequest,
    res: Response): Promise<void> {
    res.render('audits/index');
  }

  public async getAuditData(
    req: AuthedRequest,
    res: Response,
    error = '',
    audits: Audit[] = null,
    courts: Court[] = null): Promise<void> {

    // Access the provided query parameters for the audits
    // The page and limit are mandatory. Limit will default to 20,
    // size will increase by 1 for each button pressed.
    const page = req.query?.page ? req.query.page as unknown as number: 0;
    const limit = 10 as number;
    const location = req.query?.location ? req.query.location as string : '';
    const email = req.query?.email ? req.query.email as string : '';
    const dateFrom = req.query?.dateFrom ? req.query.dateFrom as string : '';
    const dateTo = req.query?.dateTo as string ? req.query.dateTo as string : '';

    console.log(page);
    console.log(limit);
    console.log(location);
    console.log(email);
    console.log(dateFrom);
    console.log(dateTo);

    if (!courts) {
      await req.scope.cradle.api.getCourts()
        .then((value: Court[]) => courts = value)
        .catch(() => error = this.getCourtsErrorMsg);
    }

    if (!audits) {
      await req.scope.cradle.api.getAudits(page, limit, location, email, dateFrom, dateTo)
        .then((value: Audit[]) => audits = value)
        .catch(() => error = this.getAuditsErrorMsg);
    }

    if (audits)
      // eslint-disable-next-line @typescript-eslint/camelcase
      audits.forEach(a => a.creation_time = new Date(a.creation_time).toLocaleString());

    const pageData: AuditPageData = {
      audits: audits,
      courts: courts,
      errorMsg: error
    };

    console.log(pageData.audits);

    res.render('audits/auditContent', pageData);
  }
}
