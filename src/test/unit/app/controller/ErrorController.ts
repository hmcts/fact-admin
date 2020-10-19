import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import { ErrorController } from '../../../../main/app/controller/ErrorController';

const i18n = {
  error: {},
  'not-found': {}
};

describe('ErrorController', () => {
  const logger = {
    error: async (message: string) => message
  } as any;

  test('Should render error pages', async () => {
    const controller = new ErrorController(logger, true);

    const err = { status: 400, message: 'Bad request' } as any;
    const req = mockRequest(i18n);
    const res = mockResponse();
    await controller.internalServerError(err, req, res);

    expect(res.render).toBeCalledWith('error', i18n.error);
    expect(res.statusCode).toBe(err.status);
  });

  test('Should render not found', async () => {
    const controller = new ErrorController(logger, true);

    const req = mockRequest(i18n);
    const res = mockResponse();
    await controller.notFound(req, res);

    expect(res.render).toBeCalledWith('not-found', i18n['not-found']);
  });

});
