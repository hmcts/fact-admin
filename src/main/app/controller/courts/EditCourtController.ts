import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';
import {CourtLock} from '../../../types/CourtLock';
import {CSRF} from '../../../modules/csrf';
import config from 'config';
import {changeDateToUTCDate, getCurrentDatePlusMinutes} from '../../../utils/DateUtils';

@autobind
export class EditCourtController {
  /**
   * GET /courts/:slug/edit
   * render the view with data from database for edit court
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {

    // Check if the court is currently in use by any other user
    const courtLocks = await req.scope.cradle.api.getCourtLocks(req.params.slug);
    const currentUserEmail = req.appSession.user.sub;
    const court_name = (req.params.slug).replace(/-/g, ' ').replace(/(\b[a-z](?!\s))/g, (c) => c.toUpperCase());
    if (courtLocks.length == 0) {
      // If there are no locks, assign the current user to the court
      await req.scope.cradle.api.addCourtLock(req.params.slug, {
        court_slug: req.params.slug, user_email: currentUserEmail
      } as CourtLock);
    } else {
      // At the moment, the limit is one lock; but this may be extended in the future.
      // So for now we can check the first user only
      if (courtLocks[0]['user_email'] != currentUserEmail) {
        if (changeDateToUTCDate(new Date()) > getCurrentDatePlusMinutes(courtLocks[0]['lock_acquired'],
          config.get('lock.timeout') as number)) {
          // If the time of their last action would require the lock to be deleted,
          // then remove and transition over to this user instead.
          await req.scope.cradle.api.deleteCourtLocks(req.params.slug, courtLocks[0]['user_email']);
          await req.scope.cradle.api.addCourtLock(req.params.slug, {
            court_slug: req.params.slug,
            user_email: currentUserEmail
          } as CourtLock);
        } else {
          // Otherwise redirect back to the courts page and display an error

          return res.render('courts/courts', {
            'courts': await req.scope.cradle.api.getCourts(),
            'errors': [{
              text: `${court_name} is currently in use by ${courtLocks[0]['user_email']}. ` +
                'Please contact them to finish their changes, or try again later.'
            }]
          });
        }
      }
      // If the user is the same, do nothing. Or continue once the delete and add has been applied if the
      // condition of time is met
    }
    return await this.renderEditPage(req.scope.cradle.featureFlags, req, res);
  }

  private async renderEditPage(featureFlagsClient: any, req: any, res: any) {

    const pageData: CourtPageData = {
      isSuperAdmin: req.appSession.user.isSuperAdmin,
      slug: req.params.slug,
      name: (await req.scope.cradle.api.getCourt(req.params.slug)).name,
      csrfToken: CSRF.create(),
    };

    res.render('courts/edit-court-general', pageData);
  }
}
