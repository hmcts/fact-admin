import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class AddressesController {
  private tabId = '#courtAddressesTab';
  private contentId = '#addressesContent';
  private formId = '#addressForm';
  private clearSecondaryBtnId = '#removeSecondaryAddressBtn';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getCourtAddresses();
        this.setUpSubmitEventHandler();
        this.setUpClearSecondaryEventHandler();
      }
    });
  }

  private getCourtAddresses(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/addresses`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.contentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court addresses failed.')
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
        await this.updateContent(res, this.contentId);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT court addresses failed.'));
    });
  }

  private setUpClearSecondaryEventHandler(): void {
    $(this.tabId).on('click', this.clearSecondaryBtnId, () => {
      $('#secondaryAddressLines').val('');
      $('#secondaryAddressLinesWelsh').val('');
      $('#secondaryAddressTown').val('');
      $('#secondaryAddressTownWelsh').val('');
      $('#secondaryAddressPostcode').val('');
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({scope: document.getElementById('courtAddressesTab')});
    window.scrollTo(0, 0);
  }
}
