import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Error} from '../../../types/Error';
import {PhotoPageData} from '../../../types/PhotoPageData';
import config from 'config';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {CourtPhoto} from '../../../types/CourtPhoto';
import {AzureBlobStorage} from '../../azure/AzureBlobStorage';

@autobind
export class PhotoController {

  getCourtPhotoErrorMsg = 'A problem occurred when retrieving the court photo. ';
  putCourtPhotoErrorMsg = 'A problem occurred when updating the court photo. ';
  imageTypeError = 'File must be a JPEG or PNG.';
  imageSizeError = 'File must be a less than 2mb.';

  azureBlobStorage = new AzureBlobStorage();

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const imageFileName = req.body.name as string;
    const slug: string = req.params.slug as string;
    const fileType = req.body.fileType;
    const oldCourtPhoto = req.body.oldCourtPhoto as string;
    const imageFile = req.file;

    if (fileType !== 'image/png' && fileType !== 'image/jpeg') {
      return this.render(req, res, [this.imageTypeError], false, this.imageTypeError, null);
    }

    if (imageFile.size > 2000000) {
      return this.render(req, res, [this.imageSizeError], false, this.imageSizeError, null);
    }

    if (!CSRF.verify(req.body.csrfToken)) {
      return this.render(req, res, [this.putCourtPhotoErrorMsg], false);
    }

    await this.azureBlobStorage.uploadImageFileToAzure(imageFile, imageFileName)
      .then(async () => {
        const courtPhoto = {'image_name': imageFileName} as CourtPhoto;
        await req.scope.cradle.api.updateCourtImage(slug, courtPhoto);
        if (oldCourtPhoto) {
          await this.azureBlobStorage.deleteImageFileFromAzure(oldCourtPhoto);
        }
        await this.render(req, res, [], true, null, imageFileName);
      })
      .catch(async (reason: AxiosError) => {
        await this.render(req, res, [this.putCourtPhotoErrorMsg], false);
        console.log(reason);
      });
  }

  public async delete(req: AuthedRequest, res: Response): Promise<void> {
    const slug: string = req.params.slug as string;
    const oldCourtPhoto = req.body.oldCourtPhoto as string;

    if (!CSRF.verify(req.body.csrfToken)) {
      return this.render(req, res, [this.putCourtPhotoErrorMsg], false);
    }

    await req.scope.cradle.api.updateCourtImage(slug, {'image_name': null} as CourtPhoto)
      .then(async () => {
        await this.azureBlobStorage.deleteImageFileFromAzure(oldCourtPhoto);
        await this.render(req, res, [], true);
      })
      .catch(async (reason: AxiosError) => {
        await this.render(req, res, [this.putCourtPhotoErrorMsg], false);
        console.log(reason);
      });
  }

  private async render(
    req: AuthedRequest,
    res: Response,
    errorMsg: string[] = [],
    updated = false,
    uploadError: string = null,
    courtPhotoFileName: string = null,
    courtPhotoFileURL: string = null): Promise<void> {
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
      courtPhotoFileURL = config.get('services.image-store.url') + '/' + courtPhotoFileName;
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: PhotoPageData = {
      courtPhotoFileName: courtPhotoFileName,
      courtPhotoFileURL: courtPhotoFileURL,
      slug: slug,
      errorMsg: errors,
      updated: updated,
      uploadError: uploadError
    };

    res.render('courts/tabs/photoContent', pageData);
  }
}
