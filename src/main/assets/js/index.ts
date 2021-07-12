import '../scss/main.scss';
import './bulk-update';
import './tinymce.config';
import './opening-hours';
import './emails';
import './court-types';
import './postcodes';
import {OpeningHoursController} from './opening-hours';
import {EmailsController} from './emails';
import {CourtGeneralInfoController} from './courtGeneralInfo';
import {PhoneNumbersController} from './phone-numbers';
import {CourtTypesController} from './court-types';
import {LocalAuthoritiesController} from './local-authorities';
import {PostcodesController} from './postcodes';

const {initTabs} = require('./fact-tabs/fact-tabs-index');

const { initAll } = require('govuk-frontend');

initTabs();
initAll();
new OpeningHoursController();
new EmailsController();
new CourtGeneralInfoController();
new PhoneNumbersController();
new CourtTypesController();
new PostcodesController();
new LocalAuthoritiesController();
