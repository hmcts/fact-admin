import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Error} from '../../../types/Error';
import {PhotoPageData} from '../../../types/PhotoPageData';
import config from 'config';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
import {
  BlobServiceClient,
  BlockBlobClient,
  BlockBlobUploadHeaders,
  newPipeline,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import {CourtPhoto} from '../../../types/CourtPhoto';

@autobind
export class PhotoController {

  getCourtPhotoErrorMsg = 'A problem occurred when retrieving the court photo. ';
  putCourtPhotoErrorMsg = 'A problem occurred when updating the court photo. ';
  imageTypeError = 'File must be a JPEG or PNG.';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const imageFileName = req.body.name as string;
    const slug: string = req.params.slug as string;
    const fileType = req.body.fileType;
    const oldCourtPhoto = req.body.oldCourtPhoto as string;
    const imageFile = req.file;

    if (fileType !== ('image/jpeg' || 'image/png')) {
      return this.render(req, res, [this.imageTypeError], false, this.imageTypeError, null);
    }

    if (!CSRF.verify(req.body.csrfToken)) {
      return this.render(req, res, [this.putCourtPhotoErrorMsg], false);
    }

    await this.uploadImageFileToAzure(imageFile, imageFileName)
      .then(async () => {
        const courtPhoto = {'image_name': imageFileName} as CourtPhoto;
        await req.scope.cradle.api.updateCourtImage(slug, courtPhoto);
        if (oldCourtPhoto) {
          await this.deleteImageFileFromAzure(oldCourtPhoto);
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
        await this.deleteImageFileFromAzure(oldCourtPhoto);
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

  public async uploadImageFileToAzure(file: File, fileName: string): Promise<BlockBlobUploadHeaders> {
    const blobClient = this.getAzureBlockBlobClient(fileName);

    // set mimetype as determined from browser with file upload control
    const options = { blobHTTPHeaders: { blobContentType: file.type } };

    // upload file
    return await blobClient.uploadData(file, options);
  }

  private async deleteImageFileFromAzure(imageFileName: string): Promise<void> {
    const blockBlobClient = this.getAzureBlockBlobClient(imageFileName);
    try {
      await blockBlobClient.delete();
    } catch (err) {
      console.log(err);
    }
  }

  private getAzureBlockBlobClient(imageFileName: string): BlockBlobClient {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      config.get('services.image-store.account-name'),
      config.get('services.image-store.account-key'));
    const pipeline = newPipeline(sharedKeyCredential);

    const blobServiceClient = new BlobServiceClient(
      `https://${config.get('services.image-store.account-name')}.blob.core.windows.net`,
      pipeline
    );
    const containerClient = blobServiceClient.getContainerClient('images');
    return containerClient.getBlockBlobClient(imageFileName);
  }
}
