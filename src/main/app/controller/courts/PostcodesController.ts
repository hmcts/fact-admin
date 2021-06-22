import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Postcode, PostcodeData} from '../../../types/Postcode';
import {Error} from '../../../types/Error';

@autobind
export class PostcodesController {

  getPostcodesErrorMsg = 'A problem occurred when retrieving the postcodes.';

  public async get(
    req: AuthedRequest,
    res: Response): Promise<void> {
    let postcodes: Postcode[] = null;
    const slug: string = req.params.slug as string;
    const errors: Error[] = [];

    await req.scope.cradle.api.getPostcodes(slug)
      .then((value: Postcode[]) => postcodes = value)
      .catch(() => errors.push({text: this.getPostcodesErrorMsg}));

    const pageData: PostcodeData = {
      postcodes: postcodes,
      slug: slug,
      errors: errors
    };
    res.render('courts/tabs/postcodesContent', pageData);
  }
}
