import $ from 'jquery';
import tinymce from 'tinymce';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
const { initAll } = require('govuk-frontend');

export class ApplicationProgressionController {

  private applicationProgressionTabId = '#applicationProgressionTab';
  private applicationProgressionContentId = '#applicationProgressionContent';
  private applicationProgressionFormId = '#applicationProgressionForm';
  private redirectBtnId = '#redirectBtnId';

  constructor() {
    this.initialize();
  }

  private initialize() {
    $(() => {
      if ($(this.applicationProgressionTabId).length > 0) {
        this.getApplicationProgression();
        this.setUpSubmitEventHandler();
        this.setUpRedirectHandler();
      }
    });
  }

  private async updateContent(content: any): Promise<void> {
    $(this.applicationProgressionContentId).html(content);

    await Utilities.setUpTinymce();

    initAll({ scope: document.getElementById('applicationProgressionTab') });

    window.scrollTo(0, 0);
  }

  private getApplicationProgression(): void {
    const slug = $('#slug').val();

    console.log('PINGPING');

    $.ajax({
      url: `/courts/${slug}/application-progression`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET application progression failed.')
    });
  }

  private setUpSubmitEventHandler() {
    $(this.applicationProgressionFormId).on('submit', e => {
      e.preventDefault();

      tinymce.triggerSave();

      const url = $(e.target).attr('action');

      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(async res => {
        await this.updateContent(res);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST application progression failed.'));
    });
  }

  private setUpRedirectHandler() {
    $(this.applicationProgressionFormId).on('click', `${this.redirectBtnId}`, e => {
      const redirectURL = e.target.getAttribute('href');
      window.location.href = redirectURL;
    });
  }
}
