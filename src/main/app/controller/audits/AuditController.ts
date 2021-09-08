import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Audit} from '../../../types/Audit';

@autobind
export class AuditController {


  public async get(
    req: AuthedRequest,
    res: Response,
    audits: Audit[] = null): Promise<void> {

    // Access the provided query parameters for the audits
    // The page and limit are mandatory. Limit will default to 20,
    // size will increase by 1 for each button pressed.
    const page = req.query?.page ? req.query.page : 0;
    const limit = 20;
    const location = req.query.location;
    const email = req.query.email;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;

    console.log(page);
    console.log(limit);
    console.log(location);
    console.log(email);
    console.log(dateFrom);
    console.log(dateTo);




    res.render('audits/index');
  }
}
