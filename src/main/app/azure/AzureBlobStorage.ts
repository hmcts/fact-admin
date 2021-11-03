import autobind from 'autobind-decorator';import config from 'config';
import {
  BlobServiceClient,
  ContainerClient,
  newPipeline,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

@autobind
export class AzureBlobStorage {
  private static containerClient: ContainerClient

  constructor() {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      config.get('services.image-store.account-name'),
      config.get('services.image-store.account-key'));
    const pipeline = newPipeline(sharedKeyCredential);

    const blobServiceClient = new BlobServiceClient(
      `https://${config.get('services.image-store.account-name')}.blob.core.windows.net`,
      pipeline
    );
    AzureBlobStorage.containerClient = blobServiceClient.getContainerClient('images');
    console.log('Azure instance created');
  }

  public async uploadImageFileToAzure(file: File, imageFileName: string): Promise<void> {
    const blockBlobClient = AzureBlobStorage.containerClient.getBlockBlobClient(imageFileName);

    // set mimetype as determined from browser with file upload control
    const options = { blobHTTPHeaders: { blobContentType: file.type } };

    try {
      await blockBlobClient.uploadData(file, options);
    } catch (err) {
      console.log(err);
    }
  }

  public async deleteImageFileFromAzure(imageFileName: string): Promise<void> {
    const blockBlobClient = AzureBlobStorage.containerClient.getBlockBlobClient(imageFileName);
    try {
      await blockBlobClient.delete();
    } catch (err) {
      console.log(err);
    }
  }
}
