import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Audit, AuditPageData} from '../../../types/Audit';
import {Court} from '../../../types/Court';

@autobind
export class AuditController {

  getAuditsErrorMsg = 'A problem occurred when retrieving the audit data.';
  getCourtsErrorMsg = 'A problem occurred when retrieving the courts data.';
  bothDateToAndFromErrorMsg = 'Both date from and to options need to be entered; not one or the other.';
  afterDateBeforeToDateError = 'The before date cannot be higher than the to date.';

  // Need to have the render separately
  // This method renders the header/footer and the div, and the subsequent one will constitute the content
  // which includes the table of audits
  public async get(req: AuthedRequest,
    res: Response): Promise<void> {
    res.render('audits/index');
  }

  public async getAuditData(
    req: AuthedRequest,
    res: Response): Promise<void> {

    // Access the provided query parameters for the audits
    // The page and limit are mandatory. Limit will default to 20,
    // size will increase by 1 for each button pressed.
    const page = req.query?.page ? req.query.page as unknown as number: 0;
    const limit = 10 as number;
    const location = req.query?.location ? req.query.location as string : '';
    const email = req.query?.email ? req.query.email as string : '';
    const dateFrom = req.query?.dateFrom ? req.query.dateFrom as string : '';
    const dateTo = req.query?.dateTo as string ? req.query.dateTo as string : '';
    const errors: { text: string }[] = [];
    let audits: Audit[] = [];
    let courts: Court[] = [];

    await req.scope.cradle.api.getCourts()
      .then((value: Court[]) => courts = value)
      .catch(() => errors.push({text: this.getCourtsErrorMsg}));

    // If we can get the courts back without an error,
    // Perform date validation and get the audit data
    if(!errors.length) {

      if (dateFrom == '' && dateTo != '' || dateFrom != '' && dateTo == '') {
        errors.push({text: this.bothDateToAndFromErrorMsg});
      } else if (Date.parse(dateTo) < Date.parse(dateFrom)) {
        errors.push({text: this.afterDateBeforeToDateError});
      } else if (!audits.length) {

        await req.scope.cradle.api.getAudits(page, limit, location, email, dateFrom, dateTo)
          .then((value: Audit[]) => audits = value)
          .catch(() => errors.push({text: this.getAuditsErrorMsg}));
      }
    }

    if (audits.length)
      audits.forEach(a => a.creation_time = new Date(a.creation_time).toLocaleString());

    const pageData: AuditPageData = {
      audits: audits,
      courts: courts,
      errors: errors,
      currentPage: page,
      searchOptions: {
        username: email,
        location: location,
        dateFrom: dateFrom,
        dateTo: dateTo
      }
    };

    res.render('audits/auditContent', pageData);
  }
}
