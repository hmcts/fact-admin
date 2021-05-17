import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
const { initAll } = require('govuk-frontend');

export class PhoneNumbersController {
  private formId = '#phoneNumbersForm';
  private tabId = '#phoneNumbersTab';
  private newPhoneNumHeadingId = '#newPhoneNumberHeading';
  private phoneNumsContentId = '#phoneNumbersContent';
  private deleteBtnClass = 'deletePhoneNumber';
  private addPhoneNumBtnName = 'addPhoneNumber';
  private typeSelectName = 'type_id';
  private numberInputName = 'number';
  private explanationInputName = 'explanation';
  private explanationCyInputName = 'explanation_cy';
  private faxInputName = 'fax';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getContacts();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
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
    $(this.tabId).on('click', `button[name="${this.addPhoneNumBtnName}"]`, e => {
      // Copy new phone number fields to main table.
      const addNewFieldset = e.target.closest('fieldset');
      const copyFieldset = $(addNewFieldset).clone();
      $(`${this.newPhoneNumHeadingId}`).before(copyFieldset);

      // Set the value of the select to that chosen in 'add new'.
      const type = $(addNewFieldset).find('select').val();
      $(copyFieldset).find('select')
        .val(type)
        .attr('name', this.getInputName(this.typeSelectName, 0));
      $(copyFieldset).find('input[name="newPhoneNumber"]').attr('name', this.getInputName(this.numberInputName, 0));
      $(copyFieldset).find('input[name="newPhoneNumberExplanation"]').attr('name', this.getInputName(this.explanationInputName, 0));
      $(copyFieldset).find('input[name="newPhoneNumberExplanationCy"]').attr('name', this.getInputName(this.explanationCyInputName, 0));
      $(copyFieldset).find('input[name="newPhoneNumberIsFax"]').attr('name', this.getInputName(this.faxInputName, 0));

      // Set the id and names of the elements in the table
      this.renameFormElements();

      // Change button type in newly added row from 'add' to 'delete'.
      $(copyFieldset).find('button').replaceWith(
        '<button type="button" name="deletePhoneNumber" ' +
        `class="govuk-button govuk-button--secondary ${this.deleteBtnClass}" data-module="govuk-button">Remove</button>`);

      // Reset select and input values on 'add new' row.
      $(addNewFieldset).find('input, select').val('');
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button.${this.deleteBtnClass}`, e => {
      e.target.closest('fieldset').remove();
      this.renameFormElements();
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
  }

  private renameFormElement(elementType: string, name: string): void {
    $(`${this.tabId} ${elementType}[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(`${name}`, idx))
      .attr('id', idx => `${name}-` + idx);
  }

  private updateContent(res: any): void {
    $(this.phoneNumsContentId).html(res);
    initAll({ scope: document.getElementById('phoneNumbersTab')});
  }
}
