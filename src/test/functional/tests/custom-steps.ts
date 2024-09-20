import { config as testConfig } from '../../config';

export = function () {
  return actor({
    loginAsSuperAdmin: function (
      username = testConfig.SUPER_ADMIN_USERNAME,
      password = testConfig.TEST_PASSWORD
    ) {
      this.amOnPage(testConfig.TEST_URL);
      this.see('Sign in');
      this.fillField('#username', secret(username));
      this.fillField('#password', secret(password));
      this.click('Sign in');
      this.waitForText('Courts and tribunals');
    },

    logout: function () {
      this.click('log out');
      this.waitForText('Sign in');
    },
  });
};
