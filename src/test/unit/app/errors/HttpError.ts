import { expect } from 'chai';
import {HTTPError} from '../../../../main/app/errors/HttpError';
import {constants as http} from 'http2';

describe('HTTPError', function () {
  it('should initiate status', function () {
    const httpError = new HTTPError(http.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    expect(httpError).to.have.property('status', http.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  });
});
