import '../scss/main.scss';
const { initAll } = require('govuk-frontend');
import './bulk-update';
import './tinymce.config';
import './opening-hours';
import {OpeningHoursController} from './opening-hours';

initAll();
new OpeningHoursController();
