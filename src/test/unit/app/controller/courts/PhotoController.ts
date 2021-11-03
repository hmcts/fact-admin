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
  const imageFile = new File([''], 'filename', { type: 'image/jpeg' });

  const getCourtImage: (testSlug: string) => string = () => getCourtImageData;
  const updateCourtImage: (testSlug: string, updateCourtImageData: string) => string = () => updateCourtImageData;

  const controller = new PhotoController();

  beforeEach(() => {
    mockApi = {
      getCourtImage: async (): Promise<string> => getCourtImage(testSlug),
      updateCourtImage: async (): Promise<string> => updateCourtImage(testSlug, updateCourtImageData)
    };

    CSRF.create = jest.fn().mockReturnValue('validCSRFToken');
    CSRF.verify = jest.fn().mockReturnValue(true);

    jest.spyOn(mockApi, 'getCourtImage');
    jest.spyOn(mockApi, 'updateCourtImage');
  });

  test('Should get photo view and render the page', async () => {
    const req = mockRequest();
    const res = mockResponse();
    req.params = {
      slug: testSlug
    };
    req.scope.cradle.api = mockApi;

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

    await controller.put(req, res);

    expect(res.render).toBeCalledWith('courts/tabs/photoContent', {
      courtPhotoFileName: updateCourtImageData,
      courtPhotoFileURL: updatedCourtImageURLData,
      slug: testSlug,
      errorMsg: [],
      updated: true,
      uploadError: null
    });
    expect(mockApi.updateCourtImage).toBeCalledWith(testSlug, updateCourtImageData);
  });

});
