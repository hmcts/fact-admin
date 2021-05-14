import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class OpeningHoursController {
  private formId = '#openingTimesForm';
  private tabId = '#openingTimesTab';
  private newOpeningTimeHeadingId = '#newOpeningHoursHeading';
  private openingTimesContentId = '#openingTimesContent';
  private deleteBtnClass = 'deleteOpeningTime';
  private addOpeningTimesBtnName = 'addOpeningTime';
  private typeSelectName = 'type_id';
  private hoursInputName = 'hours';

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
    $(this.tabId).on('click', `button[name="${this.addOpeningTimesBtnName}"]`, e => {
      // Copy new opening hours fields to main table.
      const addNewFieldset = e.target.closest('fieldset');
      const copyFieldset = $(addNewFieldset).clone();
      $(`${this.newOpeningTimeHeadingId}`).before(copyFieldset);

      // Set the value of the select to that chosen in 'add new'.
      const type = $(addNewFieldset).find('select').val();
      $(copyFieldset).find('select')
        .val(type)
        .attr('name', this.getInputName(this.typeSelectName, 0));
      $(copyFieldset).find('input').attr('name', this.getInputName(this.hoursInputName, 0));

      // Set the id and names of the elements in the table
      this.renameFormElements();

      // Change button type in newly added row from 'add' to 'delete'.
      $(copyFieldset).find('button').replaceWith(
        '<button type="button" name="deleteOpeningHours" ' +
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
  }
}
