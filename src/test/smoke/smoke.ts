const superagent = require('superagent');
const { config } = require('../config');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Smoke Test', () => {
  describe('fact admin health check', () => {
    test('should return status 200', async () => {
      const response = await superagent.get(config.TEST_URL + '/health');
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.text)['status']).toBe('UP');
    });
  });

  describe('idam api health check', () => {
    test('should return status 200', async () => {
      const response = await superagent.get(config.IDAM_HEALTH_URL);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.text)['status']).toBe('UP');
    });
  });

  describe('idam user dashboard health check', () => {
    test('should return status 200', async () => {
      const response = await superagent.get(config.IDAM_USER_DASHBOARD_HEALTH_URL);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.text)['status']).toBe('UP');
    });
  });

  describe('frontend dashboard health check', () => {
    test('should return status 200', async () => {
      const response = await superagent.get(config.FRONTEND_URL + '/health');
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.text)['status']).toBe('UP');
    });
  });
});
