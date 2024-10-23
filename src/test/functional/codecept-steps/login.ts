import { config as testConfig } from '../../config';
import { expect } from 'chai';
const { I, login } = inject();

When('I log in as a super-admin', function() {
  login('superAdmin');
});




