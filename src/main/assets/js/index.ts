import '../scss/main.scss';
const { initAll } = require('govuk-frontend');
import './bulk-update';
import './tinymce.config';
import './opening-hours';
import './emails';
import './court-types';
import {OpeningHoursController} from './opening-hours';
import {EmailsController} from './emails';
import {CourtGeneralInfoController} from './courtGeneralInfo';
import {PhoneNumbersController} from './phone-numbers';
import {CourtTypesController} from './court-types';


initAll();
new OpeningHoursController();
new EmailsController();
new CourtGeneralInfoController();
new PhoneNumbersController();
new CourtTypesController();
