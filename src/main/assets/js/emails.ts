import $ from 'jquery';

export class EmailsController {
  private formId = '#emailsForm';
  private tabId = '#emailsTab';
  private newEmailHeadingId = '#newEmailsHeading';
  private emailContentId = '#emailsContent';
  private deleteBtnClass = 'deleteEmail';
  private addEmailsBtnName = 'addEmail';
  private typeSelectName = 'adminEmailTypeId'
  private addressInputName = 'address';
  private explanationInputName = 'explanation';
  private explanationCyInputName = 'explanationCy';
  private explanationCyInputId = 'explanation-cy'

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getEmails();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
      }
    });
  }

  private getEmails(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/emails`,
      method: 'get',
      success: (res) => {
        $(this.emailContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        console.log('GET emails failed.')
    });
  }

  // By default this will be used when the save button is pressed
  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const url = $(e.target).attr('action');
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(res => {
        $(this.emailContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        console.log('PUT emails failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button[name="${this.addEmailsBtnName}"]`, e => {
      // Copy new emails fields to main table.
      const addNewFieldset = e.target.closest('fieldset');
      const copyFieldset = $(addNewFieldset).clone();
      $(`${this.newEmailHeadingId}`).before(copyFieldset);

      // Set the value of the select to that chosen in 'add new'.
      const type = $(addNewFieldset).find('select').val();
      $(copyFieldset).find('select')
        .val(type)
        .attr('name', EmailsController.getInputName(this.typeSelectName, 0));
      $(copyFieldset).find('#newEmailAddress').attr('name', EmailsController.getInputName(this.addressInputName, 0));
      $(copyFieldset).find('#newEmailExplanation')
        .attr('name', EmailsController.getInputName(this.explanationInputName, 0));
      $(copyFieldset).find('#newEmailExplanationCy')
        .attr('name', EmailsController.getInputName(this.explanationCyInputName, 0));

      // Set the id and names of the elements in the table
      this.renameFormElements();

      // Change button type in newly added row from 'add' to 'delete'.
      $(copyFieldset).find('button').replaceWith(
        '<button type="button" name="deleteEmails" ' +
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

  private static getInputName(name: string, index: number): string {
    return `emails[${index}][${name}]`;
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameSelectElement(this.typeSelectName, this.typeSelectName);
    this.renameInputElement(this.addressInputName, this.addressInputName);
    this.renameInputElement(this.explanationInputName, this.explanationInputName);
    this.renameInputElement(this.explanationCyInputName, this.explanationCyInputId);
  }

  private renameSelectElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} select[name$="[${attributeInputName}]"]`)
      .attr('name', idx => EmailsController.getInputName(attributeInputName, idx))
      .attr('id', idx => attributeInputId + '-' + idx);
  }

  private renameInputElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} input[name$="[${attributeInputName}]"]`)
      .attr('name', idx => EmailsController.getInputName(attributeInputName, idx))
      .attr('id', idx => attributeInputId + '-' + idx);
  }
}
