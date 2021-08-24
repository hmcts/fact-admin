import {isObjectEmpty, validateUrlFormat} from '../../../../main/utils/validation';

describe('validation', () => {
  describe('isObjectEmpty', () => {
    test('Should return true if object is empty', async () => {
      const object = {};
      const results = isObjectEmpty(object);
      expect(results).toBe(true);
    });

    test('Should return false if object is not empty', async () => {
      const object = { test: 'test' };
      const results = isObjectEmpty(object);
      expect(results).toBe(false);
    });
  });

  describe('URL validation', () => {
    const validUrlParameters = [
      { url: 'http://test.com' },
      { url: 'https://www.Mysite.com' },
      { url: 'www.test.com' },
      { url: 'http://uk.testing.com?q=testing' },
      { url: 'http://employeeInfo.com?name=peter&id=123' }
    ];

    validUrlParameters.forEach((parameter) => {
      it('Should return true for valid URL format \'' + parameter.url + '\'', async () => {
        expect(validateUrlFormat(parameter.url)).toBeTruthy();
      });
    });

    const inValidUrlParameters = [
      { url: '123' },
      { url: 'anything' },
      { url: '***' },
      { url: 'httpss://www.test.com' },
      { url: 'http:://test.com' }
    ];

    inValidUrlParameters.forEach((parameter) => {
      it('Should return false for invalid URL format \'' + parameter.url + '\'', async () => {
        expect(validateUrlFormat(parameter.url)).toBeFalsy();
      });
    });
  });
});
