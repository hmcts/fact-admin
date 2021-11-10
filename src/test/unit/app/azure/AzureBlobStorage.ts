import {AzureBlobStorage} from '../../../../main/app/azure/AzureBlobStorage';
import {ContainerClient} from '@azure/storage-blob';

jest.mock('@azure/storage-blob');

describe('AzureBlobStorage', () => {
  let azure: ContainerClient;

  beforeEach(() => {
    azure = new ContainerClient('');
  });

  const mockFile = Object.create(null);
  const imageFileName = 'image_file.name.jpeg';
  const blobServiceClient = {
    uploadData: jest.fn(),
    delete: jest.fn()
  };

  test('Should upload file to azure', async () => {
    azure.getBlockBlobClient = jest.fn().mockImplementation(() => {
      return blobServiceClient;
    });

    const controller = new AzureBlobStorage(azure);

    await controller.uploadImageFileToAzure(mockFile, imageFileName);

    expect(blobServiceClient.uploadData).toBeCalledWith(mockFile, { blobHTTPHeaders: { blobContentType: 'image/*' } });
  });

  test('Should delete file from azure', async () => {
    azure.getBlockBlobClient = jest.fn().mockImplementation(() => {
      return blobServiceClient;
    });

    const controller = new AzureBlobStorage(azure);

    await controller.deleteImageFileFromAzure(imageFileName);

    expect(blobServiceClient.delete).toBeCalledTimes(1);
  });
});
