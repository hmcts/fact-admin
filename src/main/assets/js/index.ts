import '../scss/main.scss';
import './bulk-update';
import './tinymce.config';
import './opening-hours';
import './emails';
import {OpeningHoursController} from './opening-hours';
import {EmailsController} from './emails';

const { initAll } = require('govuk-frontend');

initAll();
new OpeningHoursController();
new EmailsController();
