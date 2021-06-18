import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class PostcodesController {

  private formId = '#postcodesForm';
  private postcodesContentId = '#postcodesContent';
  // private tabId = '#postcodesTab';

  constructor() {
    this.initialize();
  }

  private initialize() {
    $(() => {
      if ($(this.formId).length > 0) {
        this.getPostcodes();
        // this.setUpSubmitEventHandler();
      }
    });
  }

  private getPostcodes(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/postcodes`,
      method: 'get',
      success: (res) => this.updateContent(res),
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET postcodes failed.')
    });
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    initAll({ scope: document.getElementById('postcodesTab')});
  }
}
