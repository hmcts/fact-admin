import $ from 'jquery';
import {Utilities} from './utilities';

export class NewCourtController {

  private formId = '#addNewCourtForm';

  constructor() {
    this.initialise();
  }

  private initialise(): void {
    $(() => {
      if ($(this.formId).length > 0) {
        $(function () {
          const redirectUrl = $('#saveNewCourtBtn').attr('href');
          if (redirectUrl !== undefined && redirectUrl !== '') {
            // Disable form, and wait for a few seconds before redirecting to the new edit page
            Utilities.toggleTabEnabled('#addNewCourtForm', false);
            setTimeout(function () {
              window.location.href = redirectUrl;
            }, 3000);
          }
        });
      }
    });
  }
}
