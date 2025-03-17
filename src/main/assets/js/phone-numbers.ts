import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
import {setUpTabClick} from './tab-reset';
const {initAll} = require('govuk-frontend');

export class PhoneNumbersController {
  private formId = '#phoneNumbersForm';
  private tabId = '#phoneNumbersTab';
  private phoneNumsContentId = '#phoneNumbersContent';
  private hiddenPhoneNumTemplateId = '#newPhoneNumberTemplate';

  private deleteBtnClass = 'deletePhoneNumber';
  private addPhoneNumBtnClass = 'addPhoneNumber';
  private clearPhoneNumBtnClass = 'clearPhoneNumber';
  private moveUpBtnClass = 'move-up';
  private moveDownBtnClass = 'move-down';

  private typeSelectName = 'type_id';
  private numberInputName = 'number';
  private explanationInputName = 'explanation';
  private explanationCyInputName = 'explanation_cy';
  private faxInputName = 'fax';
  private hiddenNewInputName = 'isNew';
  private tab = '#tab_phone-numbers';
  private header = 'header';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getContacts.bind(this));
        this.getContacts();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
        Utilities.addFieldsetReordering(this.tabId, this.moveUpBtnClass, this.moveDownBtnClass, this.renameFormElements.bind(this));
      }
    });
  }

  private getContacts(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/contacts`,
      method: 'get',
      success: (res) => this.updateContent(res),
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET phone numbers failed.')
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
      }).done(res => {
        this.updateContent(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST phone numbers failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addPhoneNumBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenPhoneNumTemplateId}`;
      const copyFieldset = $(selector).clone()
        .removeAttr('disabled')
        .removeAttr('hidden')
        .removeAttr('id');
      $(selector).before(copyFieldset);

      // Set the id and names of the elements in the table
      this.renameFormElements();
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button.${this.deleteBtnClass}`, e => {
      e.target.closest('fieldset').remove();
      this.renameFormElements();
    });
  }

  private setUpClearEventHandler(): void {
    $(this.tabId).on('click', `button.${this.clearPhoneNumBtnClass}`, e => {
      const fieldset = e.target.closest('fieldset');
      $(fieldset).find(':input:visible').each((idx: number, elem: HTMLInputElement) => {
        if (elem.type == 'checkbox') {
          elem.checked = false;
        } else {
          elem.value = '';
        }
      });
    });
  }

  private getInputName(name: string, index: number): string {
    return `contacts[${index}][${name}]`;
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameFormElement('select', this.typeSelectName);
    this.renameFormElement('input', this.numberInputName);
    this.renameFormElement('input', this.explanationInputName);
    this.renameFormElement('input', this.explanationCyInputName);
    this.renameFormElement('input', this.faxInputName);
    this.renameFormElement('input', this.hiddenNewInputName);
    this.renameHeader(this.header);
    this.renameButtonAriaLabel('moveUp', 'move up');
    this.renameButtonAriaLabel('moveDown', 'move down');
    this.renameActionButtonAriaLabel('actionOnPhoneNumbers');
  }

  private renameFormElement(elementType: string, name: string): void {
    $(`${this.tabId} ${elementType}[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(`${name}`, idx))
      .attr('id', idx => `${name}-${idx}`)
      .siblings('label').attr('for', idx => `${name}-${idx}`);
  }

  private renameHeader(name: string): void {
    // replace the index within the header.
    $(`${this.tabId} h3[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .text(idx => `Add New Phone Number ${idx+1}`);
  }

  private renameButtonAriaLabel(name: string, labelText: string): void {
    // replace the index within the aria label.
    $(`${this.tabId} button[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('aria-label', idx => `${labelText} contact number ${idx+1}`);

  }

  private renameActionButtonAriaLabel(name: string): void {
    // replace the index within the aria label for remove and clear buttons.
    $(`${this.tabId} button[name$="[${name}]"]`).each(function (idx) {
      const buttonText = $(this).text().toLowerCase();
      let newAriaLabel;

      if(buttonText.includes('clear')) {
        newAriaLabel = `clear contact number ${idx+1}`;
      } else if (buttonText.includes('remove')) {
        newAriaLabel = `remove contact number ${idx+1}`;
      } else {
        newAriaLabel = `action contact number ${idx+1}`;
      }
      $(this).attr('aria-label', newAriaLabel);
    });
  }

  private updateContent(res: any): void {
    $(this.phoneNumsContentId).html(res);
    initAll({ scope: document.getElementById('phoneNumbersTab')});
  }
}
