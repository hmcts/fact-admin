import $ from 'jquery';
import tinymce from 'tinymce';
import {AjaxErrorHandler} from './ajaxErrorHandler';
const { initAll } = require('govuk-frontend');

export class CourtGeneralInfoController {

  private generalTabId = '#generalInfoTab';
  private generalTabContentId = '#generalInfoContent';
  private generalFormId = '#generalInfoForm';

  constructor() {
    this.initialize();
  }

  private initialize() {
    $(() => {
      if ($(this.generalTabId).length > 0) {
        this.getGeneralInfo();
        this.setUpSubmitEventHandler();
      }
    });
  }

  private async updateContent(content: any): Promise<void> {
    $(this.generalTabContentId).html(content);

    tinymce.remove();
    await tinymce.init({
      selector: '.rich-editor',
      plugins: 'autolink link paste',
      menubar: '',
      toolbar: 'link bold italic underline',
      'paste_as_text': true,
      statusbar: false,
    });

    initAll({ scope: document.getElementById('generalInfoTab') });

    window.scrollTo(0, 0);
  }

  private getGeneralInfo(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/general-info`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET general info failed.')
    });
  }

  private setUpSubmitEventHandler() {
    $(this.generalFormId).on('submit', e => {
      e.preventDefault();

      tinymce.triggerSave();

      const url = $(e.target).attr('action');
      const slug = $('#slug').val();
      const updatedName = $('#edit-name').val() as string;
      const updatedSlug = updatedName.toLowerCase().replace(/[^\w\s]|_/g, '').split(' ').join('-');

      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(async res => {
        await this.updateContent(res);
        if (!$(this.generalTabContentId).has('.govuk-error-summary').length && slug !== updatedSlug) {
          window.location.href = '/courts/' + updatedSlug + '/edit#general';
        }
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST general info failed.'));
    });
  }
}
