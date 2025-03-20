import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
import {setUpTabClick} from './tab-reset';

const { initAll } = require('govuk-frontend');

export class AddressesController {
  private tabId = '#courtAddressesTab';
  private fieldsetId = '#secondary';

  private secondaryAddressFieldsOfLawRadio1 = 'input[name=\'secondaryFieldsOfLawRadio0\']';
  private secondaryAddressFieldsOfLawRadio2 = 'input[name=\'secondaryFieldsOfLawRadio1\']';
  private secondaryAddressFieldsOfLawContainer1 = '#secondaryAddressFieldsOfLawContainer0';
  private secondaryAddressFieldsOfLawContainer2 = '#secondaryAddressFieldsOfLawContainer1';
  private secondaryAddressAOLItems = 'input[name*="secondaryAddressAOLItems"]';
  private secondaryAddressCourtItems = 'input[name*="secondaryAddressCourtItems"]';
  private contentId = '#addressesContent';
  private formId = '#addressForm';
  private moveUpBtnClass = 'move-up';
  private moveDownBtnClass = 'move-down';
  private clearAddressBtnClass = 'clearAddress';
  private aolItems1 = 'secondaryAddressAOLItems0';
  private aolItems2 = 'secondaryAddressAOLItems1';
  private courtTypesItems1 = 'secondaryAddressCourtItems0';
  private courtTypesItems2 = 'secondaryAddressCourtItems1';

  private typeSelectName = 'type_id';
  private addressInputName = 'address_lines';
  private addressCyInputName = 'address_lines_cy';
  private fieldsOfLawRadio = 'secondaryFieldsOfLawRadio';
  private courtItems = 'secondaryAddressCourtItems';
  private aOLItems = 'secondaryAddressAOLItems';
  private townInputName = 'town';
  private townCyInputName = 'town_cy';
  private countySelectName = 'county_id';
  private postcodeInputName = 'postcode';
  private tab = '#tab_addresses';


  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getCourtAddresses.bind(this));
        this.getCourtAddresses();
        this.setUpSubmitEventHandler();
        this.setUpClearEventHandler();
        Utilities.addFieldsetReordering(this.tabId, this.moveUpBtnClass, this.moveDownBtnClass, this.renameFormElements.bind(this));
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
        this.setUpAddressFOLChangeToggle(this.secondaryAddressFieldsOfLawRadio1, this.secondaryAddressFieldsOfLawContainer1);
        this.setUpAddressFOLChangeToggle(this.secondaryAddressFieldsOfLawRadio2, this.secondaryAddressFieldsOfLawContainer2);
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
        this.setUpAddressFOLChangeToggle(this.secondaryAddressFieldsOfLawRadio1, this.secondaryAddressFieldsOfLawContainer1);
        this.setUpAddressFOLChangeToggle(this.secondaryAddressFieldsOfLawRadio2, this.secondaryAddressFieldsOfLawContainer2);

      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT court addresses failed.'));
    });
  }

  private setUpAddressFOLChangeToggle(radioElement: string, radioContainer: string): void {
    // On page load, hide checkboxes if radio option is set to no
    if ($(radioElement).filter(':checked').attr('value') === 'no') {
      $(radioContainer).hide();
    }
    // On radio change, show/hide
    $(radioElement).on('change', e => {
      e.preventDefault();
      e.target.getAttribute('value') === 'yes'
        ? $(radioContainer).show() : $(radioContainer).hide();
      $(e.target.closest('#AddressFieldsOfLawRadioContainer')).find(`input[name$="[${this.fieldsOfLawRadio}]"]`).val(e.target.getAttribute('value'));
    });
  }


  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({scope: document.getElementById('courtAddressesTab')});
    window.scrollTo(0, 0);
  }


  private static getInputName(name: string, index: number): string {
    return `secondary[${index}][${name}]`;
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameSelectElement(this.typeSelectName, this.typeSelectName);
    this.renameTextElement(this.addressInputName, this.addressInputName);
    this.renameTextElement(this.addressCyInputName, this.addressCyInputName);
    this.renameInputElement(this.fieldsOfLawRadio, this.fieldsOfLawRadio);
    this.renameInputElement(this.courtItems, this.courtItems);
    this.renameInputElement(this.aOLItems, this.aOLItems);
    this.renameInputElement(this.townInputName, this.townInputName);
    this.renameInputElement(this.townCyInputName, this.townCyInputName);
    this.renameSelectElement(this.countySelectName, this.countySelectName);
    this.renameInputElement(this.postcodeInputName, this.postcodeInputName);
    this.setUpCourtTypesAndAOLItems(this.aolItems1, this.aolItems2, this.courtTypesItems1, this.courtTypesItems2);
    this.renameButtonAriaLabel('moveUp', 'move up');
    this.renameButtonAriaLabel('moveDown', 'move down');
    this.renameActionButtonAriaLabel('actionOnAddress');
  }

  private renameSelectElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} ${this.fieldsetId} select[name$="[${attributeInputName}]"]`)
      .attr('name', idx => AddressesController.getInputName(attributeInputName, idx))
      .attr('id', idx => `${attributeInputId}-${idx}`)
      .siblings('label').attr('for', idx => `${attributeInputId}-${idx}`);
  }

  private renameInputElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} ${this.fieldsetId} input[name$="[${attributeInputName}]"]`)
      .attr('name', idx => AddressesController.getInputName(attributeInputName, idx))
      .attr('id', idx => `${attributeInputId}-${idx}`)
      .siblings('label').attr('for', idx => `${attributeInputId}-${idx}`);
  }

  private renameTextElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} ${this.fieldsetId} textarea[name$="[${attributeInputName}]"]`)
      .attr('name', idx => AddressesController.getInputName(attributeInputName, idx))
      .attr('id', idx => `${attributeInputId}-${idx}`)
      .siblings('label').attr('for', idx => `${attributeInputId}-${idx}`);
  }


  private setUpCourtTypesAndAOLItems(aolItem1: string , aolItem2: string , courtTypesItem1: string , courtTypesItem2: string ): void {
    const aolItems1 = $(`input:checkbox[name="${aolItem1}"]`);
    const aolItems2 = $(`input:checkbox[name="${aolItem2}"]`);
    const courtTypesItems1 = $(`input:checkbox[name="${courtTypesItem1}"]`);
    const courtTypesItems2 = $(`input:checkbox[name="${courtTypesItem2}"]`);
    const regex = /\d+/g;  //using regex to find integer in string

    //finding the closest hidden input element to the checkboxes to determine index number within the name attribute.
    const aOLItemsName1 = $(aolItems1).closest('fieldset').find(`input[name$="[${this.aOLItems}]"]`).attr('name');
    const aOLItemsName2 = $(aolItems2).closest('fieldset').find(`input[name$="[${this.aOLItems}]"]`).attr('name');
    const courtTypesItemsName1 = $(courtTypesItems1).closest('fieldset').find(`input[name$="[${this.courtItems}]"]`).attr('name');
    const courtTypesItemsName2 = $(courtTypesItems2).closest('fieldset').find(`input[name$="[${this.courtItems}]"]`).attr('name');

    //changing the index within the element name attribute of the checkboxes(court types and aol) in sync with the address order
    aolItems1.attr('name' , 'secondaryAddressAOLItems'+aOLItemsName1.match(regex)[0]);
    aolItems2.attr('name' , 'secondaryAddressAOLItems'+aOLItemsName2.match(regex)[0]);
    courtTypesItems1.attr('name' , 'secondaryAddressCourtItems'+courtTypesItemsName1.match(regex)[0]);
    courtTypesItems2.attr('name' , 'secondaryAddressCourtItems'+courtTypesItemsName2.match(regex)[0]);

    //changing the court address headings according to changed address order
    const addressHeadingName1 = $(aolItems1).closest('fieldset').find('.title');
    const addressHeadingName2 = $(aolItems2).closest('fieldset').find('.title');
    addressHeadingName1.text('Secondary Address '+(Number(aOLItemsName1.match(regex)[0])+ 1));
    addressHeadingName2.text('Secondary Address '+(Number(aOLItemsName2.match(regex)[0])+ 1));
  }

  private renameButtonAriaLabel(name: string, labelText: string): void {
    // replace the index within the aria label.
    $(`${this.tabId} button[name$="[${name}]"]`)
      .attr('name', idx => AddressesController.getInputName(name, idx))
      .attr('aria-label', idx => `${labelText} secondary address ${idx+1}`);
  }

  private renameActionButtonAriaLabel(name: string): void {
    // replace the index within the aria label for remove and clear buttons.
    $(`${this.tabId} button[name$="[${name}]"]`).each(function (idx) {
      const buttonText = $(this).text().toLowerCase();
      let newAriaLabel;

      if(buttonText.includes('clear')) {
        newAriaLabel = `clear secondary address ${idx+1}`;
      } else if (buttonText.includes('remove')) {
        newAriaLabel = `remove secondary address ${idx+1}`;
      } else {
        newAriaLabel = `action secondary address ${idx+1}`;
      }
      $(this).attr('aria-label', newAriaLabel);
    });
  }

  private setUpClearEventHandler(): void {
    $(this.tabId).on('click', `button.${this.clearAddressBtnClass}`, e => {
      $(e.target.closest('fieldset')).find('.clear').val('');
      $(e.target.closest('fieldset')).find( '#secondaryFieldsOfLawRadio-2').prop('checked', true);
      $(e.target.closest('fieldset')).find('*[id*=secondaryAddressFieldsOfLawContainer]').hide();
      $(e.target.closest('fieldset')).find($(this.secondaryAddressAOLItems)).prop('checked', false);
      $(e.target.closest('fieldset')).find($(this.secondaryAddressCourtItems)).prop('checked', false);
    });
  }

}
