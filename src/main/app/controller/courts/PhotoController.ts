import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Error} from '../../../types/Error';
import {PhotoPageData} from '../../../types/PhotoPageData';
import config from 'config';
// import {CSRF} from "../../../modules/csrf";
// import {AxiosError} from "axios";
// import { BlobServiceClient} from '@azure/storage-blob';
// import getStream from 'into-stream';
// import { v1 as uuidv1 } from 'uuid';


@autobind
export class PhotoController {

  getCourtPhotoErrorMsg = 'A problem occurred when retrieving the court photo. ';
  putCourtPhotoErrorMsg = 'A problem occurred when updating the court photo. ';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async post(req: AuthedRequest, res: Response): Promise<void> {
    const updatedPhoto = req.body;
    console.log('photoController put updated photo: ', updatedPhoto);
    console.log(req.body.csrfToken);
    // const allAreasOfLaw = req.body.allAreasOfLaw as AreaOfLaw[] ?? [];
    // if (!CSRF.verify(req.body.csrfToken)) {
    //   return this.render(req, res, [this.putCourtAreasOfLawErrorMsg], false, allAreasOfLaw, updatedCasesHeard);
    // }
    //
    // await req.scope.cradle.api.updateCourtAreasOfLaw(req.params.slug, updatedCasesHeard)
    //   .then(async (value: AreaOfLaw[]) =>
    //     await this.render(req, res, [], true, allAreasOfLaw, updatedCasesHeard))
    //   .catch(async (reason: AxiosError) => {
    //     await this.render(req, res, [this.putCourtAreasOfLawErrorMsg], false, allAreasOfLaw, updatedCasesHeard);
    //   });
  }

  private async render(
    req: AuthedRequest,
    res: Response,
    errorMsg: string[] = [],
    updated = false,
    courtPhotoFileName: string = null) {
    const slug: string = req.params.slug as string;
    if (!courtPhotoFileName) {
      await req.scope.cradle.api.getCourtImage(slug)
        .then((value: string) => {
          courtPhotoFileName = value;
        })
        .catch(() => {
          errorMsg.push(this.getCourtPhotoErrorMsg);
        });
    }

    if (courtPhotoFileName) {
      courtPhotoFileName = config.get('services.image-store.url') + '/' + courtPhotoFileName;
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: PhotoPageData = {
      courtPhotoFileName: courtPhotoFileName,
      slug: slug,
      errorMsg: errors,
      updated: updated
    };

    res.render('courts/tabs/photoContent', pageData);
  }
}
