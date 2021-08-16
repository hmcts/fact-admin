import '../scss/main.scss';
import './bulk-update';
import './tinymce.config';
import './opening-hours';
import './emails';
import './court-types';
import './postcodes';
import './local-authorities-list';
import {OpeningHoursController} from './opening-hours';
import {EmailsController} from './emails';
import {CourtGeneralInfoController} from './courtGeneralInfo';
import {PhoneNumbersController} from './phone-numbers';
import {CourtTypesController} from './court-types';
import {LocalAuthoritiesController} from './local-authorities';
import {LocalAuthoritiesListController} from './local-authorities-list';
import {PostcodesController} from './postcodes';
import {CourtsController} from './courts';
import {AddressesController} from './addresses';
import {AreasOfLawListController} from './areas-of-law-list';

const { initAll } = require('govuk-frontend');
const {initTabs} = require('./fact-tabs/fact-tabs-index');

initTabs();
initAll();
new OpeningHoursController();
new EmailsController();
new CourtGeneralInfoController();
new PhoneNumbersController();
new CourtTypesController();
new PostcodesController();
new LocalAuthoritiesController();
new CourtsController();
new AddressesController();

new LocalAuthoritiesListController();
new AreasOfLawListController();
