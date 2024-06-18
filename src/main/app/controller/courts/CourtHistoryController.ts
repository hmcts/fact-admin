import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {CSRF} from '../../../modules/csrf';
import {Error} from '../../../types/Error';
import {AxiosError} from 'axios';
import {CourtHistory, CourtHistoryData} from '../../../types/CourtHistory';

@autobind
export class CourtHistoryController {

  updateErrorMsg = 'A problem occurred when saving the court history.';
  getCourtHistoryErrorMsg = 'A problem occurred when retrieving the historical court data.';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';
  emptyCourtNameErrorMsg = 'Historical name is required.';

  /**
   * GET /admin/courts/:slug/history
   * render the view with data from database for court history tab
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsgs: Error[] = [],
    courtHistory: CourtHistory[] = null): Promise<void> {

    const slug: string = req.params.slug;
    let fatalError = false;

    if (!courtHistory) {
      // Get court history from API and set the isNew property to false on all court history entries.
      await req.scope.cradle.api.getCourtHistory(slug)
        .then((value: CourtHistory[]) => courtHistory = value.map(e => { e.isNew = false; return e; }))
        .catch(() => {
          errorMsgs.push({text: this.getCourtHistoryErrorMsg});
          fatalError = true;
        });
    }

    if (!courtHistory?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(courtHistory);
    }

    const pageData: CourtHistoryData = {
      courtHistory: courtHistory,
      errors: errorMsgs,
      updated: updated,
      fatalError: fatalError
    };
    res.render('courts/tabs/courtHistoryContent', pageData);
  }

  /**
   * PUT /admin/courts/:slug/history
   * validate input data and update the court history then re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    let courtHistory = req.body.courtHistory as CourtHistory[] ?? [];
    courtHistory.forEach(e => e.isNew = (e.isNew === true) || ((e.isNew as any) === 'true'));

    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false,[{text: this.updateErrorMsg}], courtHistory);
    }

    // Remove fully empty entries
    courtHistory = courtHistory.filter(e => !this.courtHistoryEntryIsEmpty(e));

    let errorMsgs: Error[] = [];
    errorMsgs = this.getErrorMessages(courtHistory);
    if (errorMsgs.length > 0) {
      return this.get(req, res, false, errorMsgs, courtHistory);
    }

    await req.scope.cradle.api.updateCourtHistory(req.params.slug, courtHistory)
      .then((value: CourtHistory[]) => this.get(req, res, true, [], value))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.updateErrorMsg;
        await this.get(req, res, false, [{text: error}], courtHistory);
      });
  }

  /**
   * adds an empty form so the view is rendered with one blank form
   */
  private addEmptyFormsForNewEntries(courtHistory: CourtHistory[], numberOfForms = 1): void {
    if (courtHistory) {
      for (let i = 0; i < numberOfForms; i++) {
        courtHistory.push({ court_name: null, court_name_cy: null, isNew: true });
      }
    }
  }
  /**
   * check if court history entry is empty
   */
  private courtHistoryEntryIsEmpty(courtHistory: CourtHistory): boolean {
    return (!courtHistory.court_name?.trim() && !courtHistory.court_name_cy?.trim());
  }

  /**
   * returns the error messages to the view
   */
  private getErrorMessages(courtHistory: CourtHistory[]): Error[] {
    const errorMsgs: Error[] = [];

    courtHistory.forEach((ch, index) => {
      index = index + 1;
      if (ch.court_name === '')
      {
        errorMsgs.push({text: this.emptyCourtNameErrorMsg, href: '#historicalName-'+index });
      }
    });
    return errorMsgs;
  }
}
