import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class AddressesController {
  private tabId = '#courtAddressesTab';
  private secondaryAddressFieldsOfLawRadio = 'input[name=\'secondaryFieldsOfLawRadio\']';
  private secondaryAddressFieldsOfLawContainer = '#secondaryAddressFieldsOfLawContainer';
  private secondaryAddressAOLItems = 'input[name="secondaryAddressAOLItems"]';
  private secondaryAddressCourtItems = 'input[name="secondaryAddressCourtItems"]';
  private thirdAddressFieldsOfLawRadio = 'input[name=\'thirdFieldsOfLawRadio\']';
  private thirdAddressFieldsOfLawContainer = '#thirdAddressFieldsOfLawContainer';
  private thirdAddressAOLItems = 'input[name="thirdAddressAOLItems"]';
  private thirdAddressCourtItems = 'input[name="thirdAddressCourtItems"]';
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
      const url = $(e.target).attr('action');
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done( async res => {
        await this.updateContent(res, this.contentId);
        // When the page is updated, the original button events will need to be added again
        this.setUpAddressFOLChangeToggle(this.secondaryAddressFieldsOfLawRadio, this.secondaryAddressFieldsOfLawContainer);
        this.setUpAddressFOLChangeToggle(this.thirdAddressFieldsOfLawRadio, this.thirdAddressFieldsOfLawContainer);
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

  // private secondaryAddressFieldsOfLawRadio = 'input[name=\'secondaryFieldsOfLawRadio\']';
  // private secondaryAddressFieldsOfLawContainer = '#secondaryAddressFieldsOfLawContainer';
  // private thirdAddressFieldsOfLawRadio = 'input[name=\'thirdFieldsOfLawRadio\']';
  // private thirdAddressFieldsOfLawContainer = '#thirdAddressFieldsOfLawContainer';

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
      $(this.secondaryAddressFieldsOfLawRadio + '#secondaryFieldsOfLawRadio-2').prop('checked', true);
      $(this.secondaryAddressAOLItems).prop('checked', false);
      $(this.secondaryAddressCourtItems).prop('checked', false);
      $(this.secondaryAddressFieldsOfLawContainer).hide();
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
      $(this.thirdAddressFieldsOfLawRadio + '#thirdFieldsOfLawRadio-2').prop('checked', true);
      $(this.thirdAddressAOLItems).prop('checked', false);
      $(this.thirdAddressCourtItems).prop('checked', false);
      $(this.thirdAddressFieldsOfLawContainer).hide();
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({scope: document.getElementById('courtAddressesTab')});
    window.scrollTo(0, 0);
  }
}
