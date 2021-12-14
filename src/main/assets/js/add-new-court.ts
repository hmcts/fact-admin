import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

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
      console.log('goes into if statement');
      this.getAddNewCourtData();
    });
  }

  private getAddNewCourtData(): void{
    $.ajax({
      url: '/courts/add-court-data',
      method: 'get',
      success: async (res) => {

        console.log(res);

        // await $(this.addNewCourtContentId).html(res);
        await initAll({scope: document.getElementById(this.formId)});

        this.setUpSubmitEventHandler();
        window.scrollTo(0, 0);
      },
      error: (jqxhr) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court data failed.')
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
