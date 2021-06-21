import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {PostcodeData} from '../../../types/Postcode';
import {Error} from "../../../types/Error";

@autobind
export class PostcodesController {

  getPostcodesErrorMsg = 'A problem occurred when retrieving the postcodes.';

  public async get(
    req: AuthedRequest,
    res: Response,
    postcodes: string[] = null): Promise<void> {
    const slug: string = req.params.slug as string;

    const errors: Error[] = [];

    if (!postcodes) {
      // Get postcodes from API and set the isNew property to false on all email entries.
      await req.scope.cradle.api.getPostcodes(slug)
        .then((value: string[]) => postcodes = value)
        .catch(() => errors.push({text: this.getPostcodesErrorMsg}));
    }

    const pageData: PostcodeData = {
      postcodes: postcodes,
      errors: errors,
    };
    res.render('courts/tabs/postcodesContent', pageData);
  }
}
