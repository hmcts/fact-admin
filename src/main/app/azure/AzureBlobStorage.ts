import autobind from 'autobind-decorator';
import {ContainerClient} from '@azure/storage-blob';

@autobind
export class AzureBlobStorage {
  private containerClient: ContainerClient;

  public constructor(containerClient: ContainerClient) {
    this.containerClient = containerClient;
  }

  public async uploadImageFileToAzure(file: File, imageFileName: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(imageFileName);

    // set mimetype as determined from browser with file upload control
    const options = { blobHTTPHeaders: { blobContentType: 'image/*' } };

    try {
      await blockBlobClient.uploadData(file, options);
    } catch (err) {
      console.log(err);
    }
  }

  public async deleteImageFileFromAzure(imageFileName: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(imageFileName);
    try {
      await blockBlobClient.delete();
    } catch (err) {
      console.log(err);
    }
  }
}
