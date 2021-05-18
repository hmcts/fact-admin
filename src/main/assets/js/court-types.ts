import $ from 'jquery';
import tinymce from "tinymce";
const { initAll } = require('govuk-frontend');

export class CourtTypesController {
  private formId = '#courtTypesForm';
  private tabId = '#courtTypesTab';
  private courtTypesContentId = '#courtTypesContent';


  constructor() {
    this.initialize();

  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getCourtTypes();
        this.setUpSubmitEventHandler();
      }
    });
  }


  private async updateContent(content: any): Promise<void> {
    $(this.courtTypesContentId).html(content);

    tinymce.remove();
    await tinymce.init({
      selector: '.rich-editor',
      plugins: 'autolink link paste',
      menubar: '',
      toolbar: 'link bold italic underline',
      'paste_as_text': true,
      statusbar: false,
    });

    initAll({ scope: document.getElementById('courtTypesTab') });

    window.scrollTo(0, 0);
  }


  private getCourtTypes(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/court-types`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        console.log('GET court types failed.')
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
      }).done( async res => {
        await this.updateContent(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        console.log('POST opening times failed.'));
    });
  }







}
