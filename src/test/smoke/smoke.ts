const superagent = require('superagent');
const { config } = require('../config');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Smoke Test', () => {
  describe('healthcheck', () => {
    test('should return status 200', async () => {
      const response = await superagent.get(config.TEST_URL);

      expect(response.statusCode).toBe(200);
    });
  });
});
