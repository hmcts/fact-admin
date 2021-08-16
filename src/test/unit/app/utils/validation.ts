import {isObjectEmpty, urlIsValid} from '../../../../main/utils/validation';

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

  describe('urlIsValid', () => {
    test('returns true for valid URLs', async () => {
      expect(urlIsValid('https://www.gov.uk/tax-tribunal')).toBe(true);
      expect(urlIsValid('http://www.gov.uk/tax-tribunal')).toBe(true);
    });

    test('returns false for invalid URLs', async () => {
      expect(urlIsValid('')).toBe(false); // empty string
      expect(urlIsValid(null)).toBe(false); // null string
      expect(urlIsValid('abc')).toBe(false); // not a url
      expect(urlIsValid('www.gov.uk/tax-tribunal')).toBe(false); // no protocol
    });
  });
});
