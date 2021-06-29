import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class PostcodesController {

  private tabId = '#postcodesTab';
  private postcodesContentId = '#postcodesContent';
  private addPostcodesBtnClass = 'addPostcodes';
  private addNewPostcodesInput = 'addNewPostcodes';
  private existingPostcodesInput = 'existingPostcodesInput';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getPostcodes();
        this.setUpAddEventHandler();
      }
    });
  }

  private getPostcodes(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/postcodes`,
      method: 'get',
      success: (res) => {
        this.updateContent(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET postcodes failed.')
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addPostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'post',
        data: {
          existingPostcodes: $(document.getElementById(this.existingPostcodesInput)).val(),
          newPostcodes: $(document.getElementById(this.addNewPostcodesInput)).val(),
          csrfToken: $(document.querySelector('#postcodesTab > input[type=hidden]')).val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST new postcodes failed.'));
    });
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    initAll({ scope: document.getElementById('postcodesTab')});
  }
}
