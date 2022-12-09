import {mockRequest} from '../../../utils/mockRequest';
import {mockResponse} from '../../../utils/mockResponse';
import {CSRF} from '../../../../../main/modules/csrf';
import {PhotoController} from '../../../../../main/app/controller/courts/PhotoController';

describe('PhotoController', () => {

  let mockApi: {
    getCourtImage: () => Promise<string>,
    updateCourtImage: () => Promise<string>};

  const testSlug = 'plymouth-combined-court';

  const getCourtImageData = 'plymouth-combined-court.jpeg';
  const updateCourtImageData = 'plymouth-combined-court-updated.jpeg';
  const courtImageURLData = `IMAGE_BASE_URL/${getCourtImageData}`;
  const updatedCourtImageURLData = `IMAGE_BASE_URL/${updateCourtImageData}`;

  const imageFile = {size: 10};
  const largeImageFile = {size: 3000000};

  const getCourtImage: (testSlug: string) => string = () => getCourtImageData;
  const updateCourtImage: (testSlug: string, updateCourtImageData: string) => string = () => updateCourtImageData;

  let mockAzureBlobStorage: {
    uploadImageFileToAzure: () => Promise<void>,
    deleteImageFileFromAzure: () => Promise<void>};

  const uploadImageFileToAzure: (object: {}, imageFileName: string) => Promise<void> = () => null;
  const deleteImageFileFromAzure: (imageFileName: string) => Promise<void> = () => null;


  const controller = new PhotoController();

  beforeEach(() => {
    mockApi = {
      getCourtImage: async (): Promise<string> => getCourtImage(testSlug),
      updateCourtImage: async (): Promise<string> => updateCourtImage(testSlug, updateCourtImageData)
    };

    mockAzureBlobStorage = {
      uploadImageFileToAzure: async (): Promise<void> => uploadImageFileToAzure(imageFile, getCourtImageData),
      deleteImageFileFromAzure: async (): Promise<void> => deleteImageFileFromAzure(getCourtImageData)
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    jest.spyOn(mockApi, 'getCourtImage');
    jest.spyOn(mockApi, 'updateCourtImage');

    jest.spyOn(mockAzureBlobStorage, 'uploadImageFileToAzure');
    jest.spyOn(mockAzureBlobStorage, 'deleteImageFileFromAzure');
  });

  test('Should get photo view and render the page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [],
      updated: false,
      uploadError: null
    });
    expect(mockApi.getCourtImage).toBeCalledWith(testSlug);
  });

  test('Should display an error if photo file name cannot be retrieved when getting court image', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;
    req.scope.cradle.api.getCourtImage = jest.fn().mockRejectedValue(new Error('Mock API Error'));

    await controller.get(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: null,
      courtPhotoFileURL: null,
      slug: testSlug,
      errorMsg: [{text: controller.getCourtPhotoErrorMsg}],
      updated: false,
      uploadError: null
    });
    expect(mockApi.getCourtImage).toBeCalledWith(testSlug);
  });

  test('Should update court photo', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'name': updateCourtImageData,
      'fileType': 'image/jpeg',
      'oldCourtPhoto': getCourtImageData,
      'csrfToken': CSRF.create()
    };
    req.file = imageFile;
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: updateCourtImageData,
      courtPhotoFileURL: updatedCourtImageURLData,
      slug: testSlug,
      errorMsg: [],
      updated: true,
      uploadError: null
    });
    expect(mockApi.updateCourtImage).toBeCalledWith(testSlug, {'image_name': updateCourtImageData });
    expect(mockAzureBlobStorage.uploadImageFileToAzure).toBeCalledWith(imageFile, updateCourtImageData);
    expect(mockAzureBlobStorage.deleteImageFileFromAzure).toBeCalledWith(getCourtImageData);
  });

  test('Should not update court image if file is too big', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'name': updateCourtImageData,
      'fileType': 'image/jpeg',
      'oldCourtPhoto': getCourtImageData,
      'csrfToken': CSRF.create()
    };
    req.file = largeImageFile;
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'File must be a less than 2mb.'}],
      updated: false,
      uploadError: 'File must be a less than 2mb.'
    });
  });

  test('Should not update court image if file type is not jpeg or png', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'name': updateCourtImageData,
      'fileType': 'image/gif',
      'oldCourtPhoto': getCourtImageData,
      'csrfToken': CSRF.create()
    };
    req.file = imageFile;
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'File must be a JPEG or PNG.'}],
      updated: false,
      uploadError: 'File must be a JPEG or PNG.'
    });
  });

  test('Should not update court image if api returns an error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    const errorResponse = mockResponse();

    req.body = {
      'name': updateCourtImageData,
      'fileType': 'image/jpeg',
      'oldCourtPhoto': getCourtImageData,
      'csrfToken': CSRF.create()
    };
    req.file = imageFile;
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtImage = jest.fn().mockRejectedValue(errorResponse);
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'A problem occurred when updating the court photo. '}],
      updated: false,
      uploadError: null
    });
  });

  test('Should not update court image if api returns a conflict error', async() => {
    const res = mockResponse();
    res.response.status = 409;
    res.response.data = {'message': 'test'};
    const req = mockRequest();

    req.body = {
      'name': updateCourtImageData,
      'fileType': 'image/jpeg',
      'oldCourtPhoto': getCourtImageData,
      'csrfToken': CSRF.create()
    };
    req.file = imageFile;
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtImage = jest.fn().mockRejectedValue(res);
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'A conflict error has occurred: test'}],
      updated: false,
      uploadError: null
    });
  });

  test('Should not update court image if CSRF token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();

    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'name': updateCourtImageData,
      'fileType': 'image/jpeg',
      'oldCourtPhoto': getCourtImageData,
      'csrfToken': CSRF.create()
    };
    req.file = imageFile;
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'A problem occurred when updating the court photo. '}],
      updated: false,
      uploadError: null
    });
  });

  test('Should render delete confirmation view', async () => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'oldCourtPhoto': getCourtImageData,
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;
    req.params.imageToDelete = getCourtImageData;

    await controller.getDeleteConfirmation(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/deletePhotoConfirm', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData
    });
  });

  test('Should delete court photo', async() => {
    const res = mockResponse();
    const req = mockRequest();
    req.body = {
      'oldCourtPhoto': getCourtImageData,
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [],
      updated: true,
      uploadError: null
    });
    expect(mockApi.updateCourtImage).toBeCalledWith(testSlug, {'image_name': null });
    expect(mockAzureBlobStorage.deleteImageFileFromAzure).toBeCalledWith(getCourtImageData);
  });

  test('Should not delete court photo if CSRF token is invalid', async() => {
    const res = mockResponse();
    const req = mockRequest();
    CSRF.verify = jest.fn().mockReturnValue(false);
    req.body = {
      'oldCourtPhoto': getCourtImageData,
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'A problem occurred when deleting the court photo. '}],
      updated: false,
      uploadError: null
    });
  });

  test('Should not delete court photo if api returns an error', async() => {
    const res = mockResponse();
    const req = mockRequest();
    const errorResponse = mockResponse();
    req.body = {
      'oldCourtPhoto': getCourtImageData,
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtImage = jest.fn().mockRejectedValue(errorResponse);
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'A problem occurred when deleting the court photo. '}],
      updated: false,
      uploadError: null
    });
  });

  test('Should not delete court photo if api returns a conflict error', async() => {
    const res = mockResponse();
    res.response.status = 409;
    res.response.data = {'message': 'test'};
    const req = mockRequest();
    req.body = {
      'oldCourtPhoto': getCourtImageData,
    };
    req.params = { slug: testSlug };
    req.scope.cradle.api = mockApi;
    req.scope.cradle.api.updateCourtImage = jest.fn().mockRejectedValue(res);
    req.scope.cradle.azure = mockAzureBlobStorage;

    await controller.delete(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: getCourtImageData,
      courtPhotoFileURL: courtImageURLData,
      slug: testSlug,
      errorMsg: [{text: 'A conflict error has occurred: test'}],
      updated: false,
      uploadError: null
    });
  });
});
