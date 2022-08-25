import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class AddressesController {
  private tabId = '#courtAddressesTab';
  private primaryAddressFieldsOfLawRadio = 'input[name=\'primaryFieldsOfLawRadio\']';
  private primaryAddressFieldsOfLawContainer = '#primaryAddressFieldsOfLawContainer';
  private secondaryAddressFieldsOfLawRadio = 'input[name=\'secondaryFieldsOfLawRadio\']';
  private secondaryAddressFieldsOfLawContainer = '#secondaryAddressFieldsOfLawContainer';
  private thirdAddressFieldsOfLawRadio = 'input[name=\'thirdFieldsOfLawRadio\']';
  private thirdAddressFieldsOfLawContainer = '#thirdAddressFieldsOfLawContainer';
  private contentId = '#addressesContent';
  private formId = '#addressForm';
  private removeSecondaryBtnId = '#removeSecondAddressBtn';
  private removeThirdBtnId = '#removeThirdAddressBtn';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getCourtAddresses();
        this.setUpSubmitEventHandler();
        this.setUpRemoveSecondaryEventHandler();
        this.setUpRemoveThirdEventHandler();
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
        this.setUpAddressFOLChangeToggle(this.primaryAddressFieldsOfLawRadio, this.primaryAddressFieldsOfLawContainer);
        this.setUpAddressFOLChangeToggle(this.secondaryAddressFieldsOfLawRadio, this.secondaryAddressFieldsOfLawContainer);
        this.setUpAddressFOLChangeToggle(this.thirdAddressFieldsOfLawRadio, this.thirdAddressFieldsOfLawContainer);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court addresses failed.')
    });
  }

  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();

      console.log(e.target);

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

  private setUpAddressFOLChangeToggle(radioElement: string, radioContainer: string): void {
    // On page load, hide checkboxes if radio option is set to no
    if ($(radioElement).filter(":checked").attr('value') === 'no') {
      $(radioContainer).hide();
    }
    // On radio change, show/hide
    $(radioElement).on('change', e => {
      e.preventDefault();
      e.target.getAttribute('value') === 'yes'
        ? $(radioContainer).show() : $(radioContainer).hide();
    });
  }

  private setUpRemoveSecondaryEventHandler(): void {
    $(this.tabId).on('click', this.removeSecondaryBtnId, () => {
      $('#secondaryAddressType').val('');
      $('#secondaryAddressDescription').val('');
      $('#secondaryAddressDescriptionWelsh').val('');
      $('#secondaryAddressLines').val('');
      $('#secondaryAddressLinesWelsh').val('');
      $('#secondaryAddressTown').val('');
      $('#secondaryAddressTownWelsh').val('');
      $('#secondaryAddressCounty').val('');
      $('#secondaryAddressPostcode').val('');
    });
  }

  private setUpRemoveThirdEventHandler(): void {
    $(this.tabId).on('click', this.removeThirdBtnId, () => {
      $('#thirdAddressType').val('');
      $('#thirdAddressDescription').val('');
      $('#thirdAddressDescriptionWelsh').val('');
      $('#thirdAddressLines').val('');
      $('#thirdAddressLinesWelsh').val('');
      $('#thirdAddressTown').val('');
      $('#thirdAddressTownWelsh').val('');
      $('#thirdAddressCounty').val('');
      $('#thirdAddressPostcode').val('');
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({scope: document.getElementById('courtAddressesTab')});
    window.scrollTo(0, 0);
  }
}
