import $ from 'jquery';
import tinymce from 'tinymce';
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
        console.log('GET general info failed.')
    });
  }

  private setUpSubmitEventHandler() {
    $(this.generalFormId).on('submit', e => {
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
        console.log('POST general info failed.'));
    });
  }
}
