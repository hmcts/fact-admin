import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

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

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getOpeningHours();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
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

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    $(`${this.tabId} select[name$="[${this.typeSelectName}]"]`)
      .attr('name', idx => this.getInputName(this.typeSelectName, idx))
      .attr('id', idx => 'description-' + idx);
    $(`${this.tabId} input[name$="[${this.hoursInputName}]"]`)
      .attr('name', idx => this.getInputName(this.hoursInputName, idx))
      .attr('id', idx => 'hours-' + idx);
    $(`${this.tabId} input[name$="[${this.hiddenNewInputName}]"]`)
      .attr('name', idx => this.getInputName(this.hiddenNewInputName, idx))
      .attr('id', idx => 'isNew-' + idx);
  }
}
