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
    console.log("Court locks are")
    console.log(courtLocks);
    console.log(req.session['user']['jwt']['sub']);

    if (courtLocks.length == 0) {
      // If there are no locks, assign the current user to the court
      await req.scope.cradle.api.addCourtLock(req.params.slug, {court_slug: req.params.slug} as CourtLock);
    } else {
      // At the moment, the limit is one lock; but this may be extended in the future.
      // So for now we can check the first user only
      if (courtLocks['user_email'] != req.session['user']['jwt']['sub']) {
        // Check if the time of their last action would require the lock to be deleted
        // and transitioned over to this user instead.
        console.log('user is different');
      } else {
        // Otherwise, allow them to proceed if it is the same user
        console.log('user is the same');
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
