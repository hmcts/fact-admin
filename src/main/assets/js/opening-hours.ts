import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
import {setUpTabClick} from './tab-reset';
const { initAll } = require('govuk-frontend');

export class OpeningHoursController {
  private formId = '#openingTimesForm';
  private tabId = '#openingTimesTab';
  private hiddenOpeningHrsTemplateId = '#newOpeningTimeTemplate';
  private openingTimesContentId = '#openingTimesContent';

  private deleteBtnClass = 'deleteOpeningTime';
  private addOpeningTimeBtnClass = 'addOpeningTime';
  private clearOpeningTimeBtnClass = 'clearOpeningTime';

  private typeSelectName = 'type_id';
  private hoursInputName = 'hours';
  private hiddenNewInputName = 'isNew';

  private moveUpBtnClass = 'move-up';
  private moveDownBtnClass = 'move-down';
  private tab = '#tab_opening-hours';
  private header = 'header';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getOpeningHours.bind(this));
        this.getOpeningHours();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
        Utilities.addFieldsetReordering(this.tabId, this.moveUpBtnClass, this.moveDownBtnClass, this.renameFormElements.bind(this));
      }
    });
  }

  private getOpeningHours(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/opening-times`,
      method: 'get',
      success: (res) => {
        $(this.openingTimesContentId).html(res);
        initAll({ scope: document.getElementById('openingTimesTab') });
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET opening times failed.')
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
        $(this.openingTimesContentId).html(res);
        initAll({ scope: document.getElementById('openingTimesTab') });
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST opening times failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addOpeningTimeBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenOpeningHrsTemplateId}`;
      const copyFieldset = $(selector).clone()
        .removeAttr('disabled')
        .removeAttr('hidden')
        .removeAttr('id');
      $(selector).before(copyFieldset);

      // Set the id and names of the elements in the table
      this.renameFormElements();
    });
  }

  private setUpClearEventHandler(): void {
    $(this.tabId).on('click', `button.${this.clearOpeningTimeBtnClass}`, e => {
      $(e.target.closest('fieldset')).find(':input:visible').val('');
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button.${this.deleteBtnClass}`, e => {
      e.target.closest('fieldset').remove();
      this.renameFormElements();
    });
  }

  private getInputName(name: string, index: number): string {
    return `opening_times[${index}][${name}]`;
  }

  private renameFormElement(type: 'input' | 'select', name: string, id: string): void {
    $(`${this.tabId} ${type}[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('id', idx => `${id}-` + idx)
      .siblings('label').attr('for', idx => `${id}-` + idx);
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameFormElement('select', this.typeSelectName, 'description');
    this.renameFormElement('input', this.hoursInputName, this.hoursInputName);
    this.renameFormElement('input', this.hiddenNewInputName, this.hiddenNewInputName);
    this.renameHeader(this.header);
    this.renameButtonAriaLabel('moveUp', 'move up');
    this.renameButtonAriaLabel('moveDown', 'move down');
    this.renameActionButtonAriaLabel('actionOnOpeningHours');
  }

  private renameHeader(name: string): void {
    // replace the index within the header.
    $(`${this.tabId} h3[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .text(idx => `Add New Opening Hours ${idx+1}`);
  }

  private renameButtonAriaLabel(name: string, labelText: string): void {
    // replace the index within the aria label.
    $(`${this.tabId} button[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('aria-label', idx => `${labelText} opening hour ${idx+1}`);
  }

  private renameActionButtonAriaLabel(name: string): void {
    // replace the index within the aria label for remove and clear buttons.
    $(`${this.tabId} button[name$="[${name}]"]`).each(function (idx) {
      const buttonText = $(this).text().toLowerCase();
      let newAriaLabel;

      if(buttonText.includes('clear')) {
        newAriaLabel = `clear opening hour ${idx+1}`;
      } else if (buttonText.includes('remove')) {
        newAriaLabel = `remove opening hour ${idx+1}`;
      } else {
        newAriaLabel = `action opening hour ${idx+1}`;
      }
      $(this).attr('aria-label', newAriaLabel);
    });
  }
}
