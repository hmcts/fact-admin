import {Response} from 'express';
import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {CourtPageData} from '../../../types/CourtPageData';
import {CourtLock} from '../../../types/CourtLock';
import {CSRF} from '../../../modules/csrf';
import * as flags from '../../feature-flags/flags';
import {ALL_FLAGS_FALSE_ERROR} from '../../../utils/error';
import {TAB_PREFIX} from '../../../utils/flagPrefix';

@autobind
export class EditCourtController {
  public async get(req: AuthedRequest, res: Response): Promise<void> {

    const featureFlags = await req.scope.cradle.featureFlags.getAllFlagValues();
    const filteredFlags = Object.fromEntries(Object.entries(featureFlags)
      .filter(([key]) => key.startsWith(TAB_PREFIX)));
    const featureFlagsCount = Object.keys(featureFlags).length;

    // Check if the court is currently in use by any other user
    const courtLocks = await req.scope.cradle.api.getCourtLocks(req.params.slug);
    if (courtLocks.length == 0) {
      // If there are no locks, assign the current user to the court
      await req.scope.cradle.api.addCourtLock(req.params.slug, {
        court_slug: req.params.slug,
        user_email: req.session['user']['jwt']['sub']
      } as CourtLock);
    } else {
      // At the moment, the limit is one lock; but this may be extended in the future.
      // So for now we can check the first user only
      const currentLockUserEmail = courtLocks[0]['user_email'];
      const currentUserEmail = req.session['user']['jwt']['sub'];
      if (currentLockUserEmail != currentUserEmail) {
        const currentTime = new Date();
        const lockTimePlusTimeout = new Date((new Date(courtLocks[0]['lock_acquired'])).getTime()
          + ((config.get('lock.timeout') as number) * 60000));
        if (currentTime > lockTimePlusTimeout) {
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
              text: `${req.params.slug} is currently in use by ${courtLocks[0]['user_email']}.
          Please contact them to finish their changes, or try again later.`
            }]
          });
        }
      }
    }

    const pageData: CourtPageData = {
      isSuperAdmin: req.session.user.isSuperAdmin,
      slug: req.params.slug,
      name: (await req.scope.cradle.api.getCourt(req.params.slug)).name,
      csrfToken: CSRF.create(),
      featureFlags: {values: featureFlags, flags: flags}
    };
    if (Object.values(filteredFlags).every((v) => v === false) && featureFlagsCount > 0) {
      pageData.error = {flagsError: {message: ALL_FLAGS_FALSE_ERROR}};
    }

    res.render('courts/edit-court-general', pageData);
  }
}
