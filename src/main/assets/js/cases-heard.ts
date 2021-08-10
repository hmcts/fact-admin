import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
// import {Utilities} from './utilities';

export class CasesHeardController {
  // private formId = '#casesHeardForm';
  // private tabId = '#casesHeardTab';
  private casesHeardContentId = '#casesHeardContent';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      // if ($(this.tabId).length > 0) {
      this.getCasesHeard();}
    // }
    );
  }

  private getCasesHeard(): void {
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/cases-heard`,
      method: 'get',
      success: (res) => {
        $(this.casesHeardContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET cases heard failed.');
        console.log(errorTextStatus);
        console.log(err);
        console.log('ERROR');
      }
    });
  }
}

