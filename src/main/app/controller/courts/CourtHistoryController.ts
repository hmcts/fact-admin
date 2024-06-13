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

  /**
   * GET /admin/courts/:slug/history
   * render the view with data from database for court history tab
   */
  public async get(
    req: AuthedRequest,
    res: Response,
    updated = false,
    errorMsg: string[] = [],
    courtHistory: CourtHistory[] = null): Promise<void> {

    console.log('CourtHistoryController.get hit! -----------------------------------------------------------------');
    const slug: string = req.params.slug;
    let fatalError = false;

    if (!courtHistory) {
      // Get emails from API and set the isNew property to false on all email entries.
      await req.scope.cradle.api.getCourtHistory(slug)
        .then((value: CourtHistory[]) => courtHistory = value.map(e => { e.isNew = false; return e; }))
        .catch(() => {errorMsg.push(this.getCourtHistoryErrorMsg); fatalError = true;});
    }

    if (!courtHistory?.some(e => e.isNew === true)) {
      this.addEmptyFormsForNewEntries(courtHistory);
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: CourtHistoryData = {
      courtHistories: courtHistory,
      errors: errors,
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
    let courtHistory = req.body.courtHistories as CourtHistory[] ?? [];
    courtHistory.forEach(e => e.isNew = (e.isNew === true) || ((e.isNew as any) === 'true'));

    if (!CSRF.verify(req.body._csrf)) {
      return this.get(req, res, false, [this.updateErrorMsg], courtHistory);
    }

    // Remove fully empty entries
    courtHistory = courtHistory.filter(e => !this.courtHistoryEntryIsEmpty(e));

    const errorMsg = this.getErrorMessages(courtHistory);
    if (errorMsg.length > 0) {
      return this.get(req, res, false, errorMsg, courtHistory);
    }

    await req.scope.cradle.api.updateCourtHistory(req.params.slug, courtHistory)
      .then((value: CourtHistory[]) => this.get(req, res, true, [], value))
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.updateErrorMsg;
        await this.get(req, res, false, [error], courtHistory);
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
   * check if email entry is empty
   */
  private courtHistoryEntryIsEmpty(courtHistory: CourtHistory): boolean {
    return (!courtHistory.court_name?.trim() && !courtHistory.court_name_cy?.trim());
  }

  /**
   * returns the error messages to the view
   */
  private getErrorMessages(courtHistories: CourtHistory[]): string[] {
    const errorMsg: string[] = [];
    // if (courtHistories.some(ot => !ot.name || ot.nameCy === '')) {
    //   // Retains the posted email data when errors exist
    //   errorMsg.push(this.emptyTypeOrAddressErrorMsg);
    // }
    return errorMsg;
  }
}
