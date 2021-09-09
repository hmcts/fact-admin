import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Audit, AuditPageData} from '../../../types/Audit';

@autobind
export class AuditController {

  getAuditsErrorMsg = 'A problem occurred when retrieving the audit data.';

  public async get(
    req: AuthedRequest,
    res: Response,
    error = '',
    audits: Audit[] = null): Promise<void> {

    // Access the provided query parameters for the audits
    // The page and limit are mandatory. Limit will default to 20,
    // size will increase by 1 for each button pressed.
    const page = req.query?.page ? req.query.page as unknown as number: 0;
    const limit = 20 as number;
    const location = req.query.location as string;
    const email = req.query.email as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;

    console.log(page);
    console.log(limit);
    console.log(location);
    console.log(email);
    console.log(dateFrom);
    console.log(dateTo);

    if (!audits) {
      await req.scope.cradle.api.getAudits(page, 20, location, email, dateFrom, dateTo)
        .then((value: Audit[]) => audits = value)
        .catch(() => error = this.getAuditsErrorMsg);
    }

    const pageData: AuditPageData = {
      audits: audits,
      errorMsg: error
    };

    console.log(pageData.audits);

    res.render('audits/index', pageData);
  }
}
