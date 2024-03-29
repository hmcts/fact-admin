import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Error} from '../../../types/Error';
import {PhotoPageData} from '../../../types/PhotoPageData';
import config from 'config';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {CourtPhoto} from '../../../types/CourtPhoto';

@autobind
export class PhotoController {

  getCourtPhotoErrorMsg = 'A problem occurred when retrieving the court photo. ';
  putCourtPhotoErrorMsg = 'A problem occurred when updating the court photo. ';
  deleteCourtPhotoErrorMsg = 'A problem occurred when deleting the court photo. ';
  imageTypeError = 'File must be a JPEG or PNG.';
  imageSizeError = 'File must be a less than 2mb.';
  courtLockedExceptionMsg = 'A conflict error has occurred: ';
  /**
   * GET /courts/:slug/photo
   * render the view with data from database for court photo tab
   */
  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }
  /**
   * PUT /courts/:slug/photo
   * validate input data and update the court photo and re-render the view
   */
  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const imageFileName = req.body.name as string;
    const slug: string = req.params.slug;
    const fileType = req.body.fileType as string;
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

    await req.scope.cradle.azure.uploadImageFileToAzure(imageFile, imageFileName)
      .then(async () => {
        const courtPhoto = {'image_name': imageFileName} as CourtPhoto;
        await req.scope.cradle.api.updateCourtImage(slug, courtPhoto);
        if (oldCourtPhoto) {
          await req.scope.cradle.azure.deleteImageFileFromAzure(oldCourtPhoto);
        }
        await this.render(req, res, [], true, null, imageFileName);
      })
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.putCourtPhotoErrorMsg;
        await this.render(req, res, [error], false);
      });
  }
  /**
   * DELETE /courts/:slug/photo
   * delete the court photo and re-render the view
   */
  public async delete(req: AuthedRequest, res: Response): Promise<void> {
    const slug: string = req.params.slug;
    const oldCourtPhoto = req.body.oldCourtPhoto as string;

    if (!CSRF.verify(req.body.csrfToken)) {
      return this.render(req, res, [this.deleteCourtPhotoErrorMsg], false);
    }

    await req.scope.cradle.api.updateCourtImage(slug, {'image_name': null} as CourtPhoto)
      .then(async () => {
        await req.scope.cradle.azure.deleteImageFileFromAzure(oldCourtPhoto);
        await this.render(req, res, [], true);
      })
      .catch(async (reason: AxiosError) => {
        const error = reason.response?.status === 409
          ? this.courtLockedExceptionMsg + (<any>reason.response).data['message']
          : this.deleteCourtPhotoErrorMsg;
        await this.render(req, res, [error], false);
      });
  }
  /**
   * GET /courts/:slug/photo/:imageToDelete/confirm-delete
   * render the delete confirmation view
   */
  public async getDeleteConfirmation(req: AuthedRequest, res: Response): Promise<void> {
    const courtPhotoFileName = req.params.imageToDelete;
    const courtPhotoFileURL = config.get('services.image-store.url') + '/' + courtPhotoFileName;
    this.renderDeleteConfirmation(res, courtPhotoFileName, courtPhotoFileURL);
  }

  private renderDeleteConfirmation(res: Response, courtPhotoFileName: string, courtPhotoFileURL: string): void {
    const pageData = {
      courtPhotoFileName: courtPhotoFileName,
      courtPhotoFileURL: courtPhotoFileURL
    };
    res.render('courts/tabs/deletePhotoConfirm', pageData);
  }

  private async render(
    req: AuthedRequest,
    res: Response,
    errorMsg: string[] = [],
    updated = false,
    uploadError: string = null,
    courtPhotoFileName: string = null,
    courtPhotoFileURL: string = null): Promise<void> {
    const slug: string = req.params.slug;
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
