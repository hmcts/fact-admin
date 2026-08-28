import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {setUpTabClick} from './tab-reset';
const { initAll } = require('govuk-frontend');

export class CourtGeneralInfoController {

  private generalTabId = '#generalInfoTab';
  private generalTabContentId = '#generalInfoContent';
  private generalFormId = '#generalInfoForm';
  private redirectBtnId = '#redirectBtnId';
  private tab = '#tab_general';

  constructor() {
    this.initialize();
  }

  private initialize() {
    $(() => {
      if ($(this.generalTabId).length > 0) {
        setUpTabClick(this.tab, this.getGeneralInfo.bind(this));
        this.getGeneralInfo();
        this.setUpSubmitEventHandler();
        this.setUpRedirectHandler();
      }
    });
  }

  private async updateContent(content: any): Promise<void> {
    $(this.generalTabContentId).html(content);
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

      const url = $(e.target).attr('action');

      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(async res => {
        await this.updateContent(res);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST general info failed.'));
    });
  }

  private setUpRedirectHandler() {
    $(this.generalFormId).on('click', `${this.redirectBtnId}`, e => {
      const redirectURL = e.target.getAttribute('href');
      window.location.href = redirectURL;
    });
  }
}
