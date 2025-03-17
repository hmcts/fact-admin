import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
import {setUpTabClick} from './tab-reset';

export class EmailsController {
  private formId = '#emailsForm';
  private tabId = '#emailsTab';
  private emailContentId = '#emailsContent';
  private hiddenNewEmailTemplateId = '#newEmailTemplate';

  private deleteBtnClass = 'deleteEmail';
  private addEmailsBtnClass = 'addEmail';
  private clearEmailBtnClass = 'clearEmail';
  private moveUpBtnClass = 'move-up';
  private moveDownBtnClass = 'move-down';

  private typeSelectName = 'adminEmailTypeId';
  private addressInputName = 'address';
  private explanationInputName = 'explanation';
  private explanationCyInputName = 'explanationCy';
  private explanationCyInputId = 'explanation-cy';
  private hiddenNewInputName = 'isNew';
  private tab = '#tab_emails';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getEmails.bind(this));
        this.getEmails();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
        Utilities.addFieldsetReordering(this.tabId, this.moveUpBtnClass, this.moveDownBtnClass, this.renameFormElements.bind(this));
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
        AjaxErrorHandler.handleError(jqxhr, 'GET emails failed.')
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
        AjaxErrorHandler.handleError(response, 'PUT emails failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addEmailsBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenNewEmailTemplateId}`;
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
    $(this.tabId).on('click', `button.${this.clearEmailBtnClass}`, e => {
      $(e.target.closest('fieldset')).find(':input:visible').val('');
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
    this.renameInputElement(this.hiddenNewInputName, this.hiddenNewInputName);
    this.renameButtonAriaLabel('moveUp', 'move up');
    this.renameButtonAriaLabel('moveDown', 'move down');
    this.renameActionButtonAriaLabel('actionOnEmailAddress');
  }

  private renameSelectElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} select[name$="[${attributeInputName}]"]`)
      .attr('name', idx => EmailsController.getInputName(attributeInputName, idx))
      .attr('id', idx => `${attributeInputId}-${idx}`)
      .siblings('label').attr('for', idx => `${attributeInputId}-${idx}`);
  }

  private renameInputElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} input[name$="[${attributeInputName}]"]`)
      .attr('name', idx => EmailsController.getInputName(attributeInputName, idx))
      .attr('id', idx => `${attributeInputId}-${idx}`)
      .siblings('label').attr('for', idx => `${attributeInputId}-${idx}`);
  }

  private renameButtonAriaLabel(name: string, labelText: string): void {
    // replace the index within the aria label.
    $(`${this.tabId} button[name$="[${name}]"]`)
      .attr('name', idx => EmailsController.getInputName(name, idx))
      .attr('aria-label', idx => `${labelText} email address ${idx+1}`);
  }

  private renameActionButtonAriaLabel(name: string): void {
    // replace the index within the aria label for remove and clear buttons.
    $(`${this.tabId} button[name$="[${name}]"]`).each(function (idx) {
      const buttonText = $(this).text().toLowerCase();
      let newAriaLabel;

      if(buttonText.includes('clear')) {
        newAriaLabel = `clear email address ${idx+1}`;
      } else if (buttonText.includes('remove')) {
        newAriaLabel = `remove email address ${idx+1}`;
      } else {
        newAriaLabel = `action email address ${idx+1}`;
      }
      $(this).attr('aria-label', newAriaLabel);
    });
  }
}
