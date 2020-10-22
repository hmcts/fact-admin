import { mockRequest } from '../../utils/mockRequest';
import { mockResponse } from '../../utils/mockResponse';
import { ErrorController } from '../../../../main/app/controller/ErrorController';

describe('ErrorController', () => {
  const logger = {
    error: async (message: string) => message
  } as any;

  test('Should render error pages', async () => {
    const controller = new ErrorController(logger, true);

    const err = { status: 400, message: 'Bad request' } as any;
    const req = mockRequest();
    const res = mockResponse();
    await controller.internalServerError(err, req, res);

    expect(res.render).toBeCalledWith('error');
    expect(res.statusCode).toBe(err.status);
  });

  test('Should render not found', async () => {
    const controller = new ErrorController(logger, true);

    const req = mockRequest();
    const res = mockResponse();
    await controller.notFound(req, res);

    expect(res.render).toBeCalledWith('not-found');
  });

});
