import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';

export class ApplicationProgressionController {

  private applicationProgressionTabId = '#applicationProgressionTab';
  private applicationProgressionContentId = '#applicationProgressionContent';
  private applicationProgressionFormId = '#applicationProgressionForm';
  private hiddenNewUpdateTemplateId = '#newUpdateTemplate';

  private deleteUpdateBtnClass = 'deleteUpdate';
  private addUpdateBtnClass = 'addUpdate';
  private clearUpdateBtnClass = 'clearUpdate';
  private moveUpBtnClass = 'move-up';
  private moveDownBtnClass = 'move-down';

  private typeInputName = 'type';
  private emailInputName = 'email';
  private externalLinkInputName = 'external_link';
  private externalLinkDescriptionInputName = 'external_link_description';
  private hiddenNewInputName = 'isNew';


  constructor() {
    this.initialize();
  }

  private initialize() {
    $(() => {
      if ($(this.applicationProgressionTabId).length > 0) {
        this.getApplicationProgression();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpSubmitEventHandler();
        this.setUpClearEventHandler();
        Utilities.addFieldsetReordering(this.applicationProgressionTabId, this.moveUpBtnClass, this.moveDownBtnClass,
          this.renameFormElements.bind(this));
      }
    });
  }

  private getApplicationProgression(): void {
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/application-progression`,
      method: 'get',
      success: (res) => {
        $(this.applicationProgressionContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET application progression failed.')
    });
  }

  private setUpSubmitEventHandler() {
    $(this.applicationProgressionFormId).on('submit', e => {
      e.preventDefault();
      const url = $(e.target).attr('action');
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(async res => {
        $(this.applicationProgressionContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST application progression failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.applicationProgressionTabId).on('click', `button.${this.addUpdateBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.applicationProgressionTabId} ${this.hiddenNewUpdateTemplateId}`;
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
    $(this.applicationProgressionTabId).on('click', `button.${this.clearUpdateBtnClass}`, e => {
      $(e.target.closest('fieldset')).find(':input:visible').val('');
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.applicationProgressionTabId).on('click', `button.${this.deleteUpdateBtnClass}`, e => {
      e.target.closest('fieldset').remove();
      this.renameFormElements();
    });
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameInputElement(this.typeInputName, this.typeInputName);
    this.renameInputElement(this.emailInputName, this.emailInputName);
    this.renameInputElement(this.externalLinkInputName, this.externalLinkInputName);
    this.renameInputElement(this.externalLinkDescriptionInputName, this.externalLinkDescriptionInputName);
    this.renameInputElement(this.hiddenNewInputName, this.hiddenNewInputName);
  }

  private renameInputElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.applicationProgressionTabId} input[name$="[${attributeInputName}]"]`)
      .attr('name', idx => ApplicationProgressionController.getInputName(
        attributeInputName, idx))
      .attr('id', idx => `${attributeInputId}-${idx}`)
      .siblings('label').attr('for', idx => `${attributeInputName}-${idx}`);
  }

  private static getInputName(name: string, index: number): string {
    return `progression[${index}][${name}]`;
  }

}
