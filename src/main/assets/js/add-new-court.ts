import $ from 'jquery';
import {Utilities} from './utilities';

export class NewCourtController {

  constructor() {
    this.initialise();
  }

  private initialise(): void {
    $(() => {
      $(function() {
        const redirectUrl = $('#saveNewCourtBtn').attr('href');
        if (redirectUrl !== undefined && redirectUrl !== '') {
          // Disable form, and wait for a few seconds before redirecting to the new edit page
          Utilities.toggleTabEnabled('#addNewCourtForm', false);
          setTimeout(function(){
            window.location.href = redirectUrl;
          }, 3000);
        }
      });
    });
  }
}
