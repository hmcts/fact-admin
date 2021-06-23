import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class PostcodesController {

  private formId = '#postcodesForm';
  private tabId = '#postcodesTab';
  private postcodesContentId = '#postcodesContent';
  // private hiddenPostcodesNumTemplateId = '#newPostcodesTemplate';
  //
  private addPostcodesBtnClass = 'addPostcodes';
  private addNewPostcodesInput = 'addNewPostcodes';

  //
  // private typeSelectName = 'type_id';
  // private numberInputName = 'number';
  // private explanationInputName = 'explanation';
  // private explanationCyInputName = 'explanation_cy';
  // private faxInputName = 'fax';
  // private hiddenNewInputName = 'isNew';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getPostcodes();
        this.setUpAddEventHandler();
        this.setUpSubmitEventHandler();
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

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addPostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'post',
        data: {
          existingPostcodes: $(e.target).attr('existingPostcodes'),
          newPostcodes: $(document.getElementById(this.addNewPostcodesInput)).val(),
          csrfToken: $(document.querySelector('#postcodesForm > input[type=hidden]')).val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST new postcodes failed.'));
    });
  }

  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();

      const url = $(e.target).attr('action');
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(res => {
        this.updateContent(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST add or move postcodes failed.'));
    });
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    initAll({ scope: document.getElementById('postcodesTab')});
  }
}
