import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

export class NewCourtController {

  private addNewCourtContentId = '#addNewCourtContent';
  private formId = '#addNewCourtForm';
  private newCourtName = '#newCourtName';

  constructor() {
    this.initialise();
  }

  private initialise(): void {
    console.log('goes into outside of if statement');
    $(() => {
      if ($(this.formId).length > 0) {
        console.log('goes into if statement');
        this.setUpSubmitEventHandler();
      }
    });
  }

  private setUpSubmitEventHandler(): void {

    $(this.formId).on('submit', e => {
      e.preventDefault();

      console.log('goes into the event handlers method');
      console.log($(this.newCourtName).val());
      console.log($(this.formId + ' input[name="_csrf"]').val());

      $.ajax({
        url: '/courts/add-court',
        method: 'post',
        data: {
          newCourtName: $(this.newCourtName).val(),
          _csrf: $(this.formId + '> input[name="_csrf"]').val()
        }
      }).done(res => {
        $(this.addNewCourtContentId).html(res);
        window.scrollTo(0, 0);

        // If we have no error, redirect to the edit page for the new court
        // window.location.href = e.target.getAttribute('href');

      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST new court has failed.'));
    });
  }
}
