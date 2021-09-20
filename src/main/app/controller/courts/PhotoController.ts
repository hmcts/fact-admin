import autobind from 'autobind-decorator';
import {AuthedRequest} from '../../../types/AuthedRequest';
import {Response} from 'express';
import {Error} from '../../../types/Error';
import {PhotoPageData} from '../../../types/PhotoPageData';
import config from 'config';
import { BlobServiceClient} from '@azure/storage-blob';
// import getStream from 'into-stream';
// import { v1 as uuidv1 } from 'uuid';


@autobind
export class PhotoController {

  getCourtPhotoErrorMsg = 'A problem occurred when retrieving the court photo. ';
  putCourtPhotoErrorMsg = 'A problem occurred when updating the court photo. ';

  public async get(req: AuthedRequest, res: Response): Promise<void> {
    await this.render(req, res);
  }

  private async render(
    req: AuthedRequest,
    res: Response,
    errorMsg: string[] = [],
    updated = false,
    courtPhoto: string = null) {
    const slug: string = req.params.slug as string;
    if (!courtPhoto) {
      await req.scope.cradle.api.getCourtImage(slug)
        .then((value: string) => {
          courtPhoto = value;
          // this.uploadPhotoToStorage(courtPhoto);
          this.getPhotoFromStorage()
            .then((result) => console.log(result))
            .catch((ex) => console.log(ex.message));
        })
        .catch(() => {
          errorMsg.push(this.getCourtPhotoErrorMsg);
        });
    }

    const errors: Error[] = [];
    for (const msg of errorMsg) {
      errors.push({text: msg});
    }

    const pageData: PhotoPageData = {
      courtPhoto: courtPhoto,
      slug: slug,
      errorMsg: errors,
      updated: updated
    };

    res.render('courts/tabs/photoContent', pageData);
  }

  // private async uploadPhotoToStorage(courtPhoto: string) {
  //
  //   const blockBlobClient = await this.connectToStorage();
  //
  //   await blockBlobClient.upload(courtPhoto, courtPhoto.length);
  // }

  private async getPhotoFromStorage() {
    //
    // const blockBlobClient = await this.connectToStorage();
    //
    // const courtPhoto = await blockBlobClient.download(0);

    const clientSecret: string = config.get('storageAccountConnectionString');
    const blobServiceClient = BlobServiceClient.fromConnectionString(clientSecret);

    let viewData;

    try {
      const containerClient = blobServiceClient.getContainerClient('quickstart1b153980-0cc1-11ec-9eae-69e436d6c807');
      const listBlobsResponse = await containerClient.listBlobFlatSegment();

      viewData = {
        title: 'Home',
        viewName: 'index',
        accountName: 'factaat',
        containerName: 'quickstart1b153980-0cc1-11ec-9eae-69e436d6c807'
      };

      if (listBlobsResponse.segment.blobItems.length) {
        viewData.thumbnails = listBlobsResponse.segment.blobItems;
      }
    } catch (err) {
      viewData = {
        title: 'Error',
        viewName: 'error',
        message: 'There was an error contacting the blob storage container.',
        error: err
      };
    }

    return viewData;
  }

  // private async connectToStorage() {
  //   const clientSecret: string = config.get('storageAccountConnectionString');
  //
  //   // Create the BlobServiceClient object which will be used to create a container client
  //   const blobServiceClient = BlobServiceClient.fromConnectionString(clientSecret);
  //
  //   // Get a reference to a container
  //   const containerClient = blobServiceClient.getContainerClient('quickstart1b153980-0cc1-11ec-9eae-69e436d6c807');
  //
  //   // Get a block blob client
  //   return containerClient.getBlockBlobClient('quickstart1b5af510-0cc1-11ec-9eae-69e436d6c807.txt');
  // }


}
