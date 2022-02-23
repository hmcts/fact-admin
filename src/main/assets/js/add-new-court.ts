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
        const addNewCourtForm = '#addNewCourtForm';
        const serviceCentreSelection = '#serviceCentreSelection';
        const serviceCentre = '#serviceCentre';
        const serviceCentre2 = '#serviceCentre-2';
        const serviceAreasContainer = '#serviceAreasContainer';

        $(function () {
          const redirectUrl = $('#saveNewCourtBtn').attr('href');
          if (redirectUrl !== undefined && redirectUrl !== '') {
            // Disable form, and wait for a few seconds before redirecting to the new edit page
            Utilities.toggleTabEnabled(addNewCourtForm, false);
            setTimeout(function () {
              window.location.href = redirectUrl;
            }, 3000);
          }
          // Base selection on whether to hide the service area list or not
          if ($(serviceCentreSelection).val() === 'false') {
            console.log('is false');
            $(serviceAreasContainer).hide();
          }
          $(serviceCentre).on('change', () => {
            $(serviceAreasContainer).toggle();
          });
          $(serviceCentre2).on('change', () => {
            $(serviceAreasContainer).toggle();
          });
        });
      }
    });
  }
}
