import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

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

    initAll({ scope: document.getElementById('courtTypesTab') });

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
        AjaxErrorHandler.handleError(jqxhr, 'GET court types failed.')
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
        this.refresh();
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST court types failed.'));
    });
  }

  private refresh(): void {
    location.reload();
  }


}
