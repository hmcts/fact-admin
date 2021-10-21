import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Error} from '../../../types/Error';
import {PhotoPageData} from '../../../types/PhotoPageData';
import config from 'config';
import {CSRF} from '../../../modules/csrf';
import {AxiosError} from 'axios';
// import getStream from 'into-stream';
import {BlobServiceClient, ContainerClient, newPipeline, StorageSharedKeyCredential} from '@azure/storage-blob';

// const { Readable } = require('stream');



@autobind
export class PhotoController {

  getCourtPhotoErrorMsg = 'A problem occurred when retrieving the court photo. ';
  putCourtPhotoErrorMsg = 'A problem occurred when updating the court photo. ';
  imageTypeError = 'File must be a JPEG or PNG.';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  public async createBlobInContainer(file: File, fileName: string) {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      config.get('services.image-store.account-name'),
      config.get('services.image-store.account-key'));
    const pipeline = newPipeline(sharedKeyCredential);

    const blobServiceClient = new BlobServiceClient(
      `https://${config.get('services.image-store.account-name')}.blob.core.windows.net`,
      pipeline
    );
    const containerClient = blobServiceClient.getContainerClient('images');
    // await containerClient.createIfNotExists({
    //   access: 'container',
    // });
    // create blobClient for container
    console.log('file name with file.name: ', fileName);

    const blobClient = containerClient.getBlockBlobClient(fileName);
    // set mimetype as determined from browser with file upload control
    const options = { blobHTTPHeaders: { blobContentType: file.type } };
    // upload file
    return await blobClient.uploadData(file, options);
  }

  public async getBlobsInContainer(containerClient: ContainerClient) {
    const returnedBlobUrls: string[] = [];
    // get list of blobs in container
    // eslint-disable-next-line
    for await (const blob of containerClient.listBlobsFlat()) {
      // if image is public, just construct URL
      returnedBlobUrls.push(
        `https://${config.get('services.image-store.account-name')}.blob.core.windows.net/images/${blob.name}`
      );
    }
    return returnedBlobUrls;
  }


  public async put(req: AuthedRequest, res: Response): Promise<void> {
    const imageFileName = req.body.name as string;
    const slug: string = req.params.slug as string;
    const fileType = req.body.fileType;
    // const imageFileBuffer = req.body.arrayBuffer;
    // const imageFileStream = req.body.readableStream;
    const imageFile = req.file;
    // console.log('image file stream', imageFileStream);
    console.log('image file', imageFile);
    console.log('name', imageFileName);
    const sharedKeyCredential = new StorageSharedKeyCredential(
      config.get('services.image-store.account-name'),
      config.get('services.image-store.account-key'));
    const pipeline = newPipeline(sharedKeyCredential);

    const blobServiceClient = new BlobServiceClient(
      `https://${config.get('services.image-store.account-name')}.blob.core.windows.net`,
      pipeline
    );
    const containerClient = blobServiceClient.getContainerClient('images');

    if (fileType !== ('image/jpeg' || 'image/png')) {
      console.log('Failed: *', fileType, '*');
      return this.render(req, res, [this.imageTypeError], false, this.imageTypeError, null);
    }

    if (!CSRF.verify(req.body.csrfToken)) {
      return this.render(req, res, [this.putCourtPhotoErrorMsg], false);
    }

    await req.scope.cradle.api.updateCourtImage(slug, imageFileName)
      .then(async () => {
        console.log('calling api');
        // await this.uploadImageFileToAzure(imageFileBuffer, imageFileName).then(async () => {
        // // await this.deleteImageFileFromAzure(imageFileName).then(async () => {
        //   console.log('calling uploadImageFile');
        //   await this.render(req, res, [], true, null, imageFileName);
        // });
        console.log('goes in here');
        const response: any = await this.createBlobInContainer(imageFile, imageFileName);
        console.log(response);
        const blobsInContainer: string[] = await this.getBlobsInContainer(containerClient);
        console.log(blobsInContainer);
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
      updated: updated,
      uploadError: uploadError
    };

    res.render('courts/tabs/photoContent', pageData);
  }

  // private async uploadImageFileToAzure(buffer: ArrayBuffer, imageFileName: string) {
  //   console.log('in uploadImageFile');
  //   const uploadOptions = { bufferSize: 4 * 1024 * 1024, maxBuffers: 20 };
  //
  //   const stream = Readable.from(buffer);
  //
  //   // const stream = getStream(buffer);
  //   const blockBlobClient = this.getAzureBlockBlobClient(imageFileName);
  //
  //   try {
  //     await blockBlobClient.uploadStream(stream, uploadOptions.bufferSize, uploadOptions.maxBuffers);
  //     console.log('Image updated');
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // private async deleteImageFileFromAzure(imageFileName: string) {
  //   const blockBlobClient = this.getAzureBlockBlobClient(imageFileName);
  //   try {
  //     await blockBlobClient.delete();
  //     console.log('Image deleted');
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // private getAzureBlockBlobClient(imageFileName: string) {
  //   const sharedKeyCredential = new StorageSharedKeyCredential(
  //     config.get('services.image-store.account-name'),
  //     config.get('services.image-store.account-key'));
  //   const pipeline = newPipeline(sharedKeyCredential);
  //
  //   const blobServiceClient = new BlobServiceClient(
  //     `https://${config.get('services.image-store.account-name')}.blob.core.windows.net`,
  //     pipeline
  //   );
  //   const containerClient = blobServiceClient.getContainerClient('images');
  //   return containerClient.getBlockBlobClient(imageFileName);
  // }

}
