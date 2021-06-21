import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class PostcodesController {
  private formId = '#postcodesForm';
  private tabId = '#postcodesTab';
  private postcodesContentId = '#postcodesContent';
  private hiddenPostcodesNumTemplateId = '#newPostcodesTemplate';

  private addPostcodesNumBtnClass = 'addPostcodesNumber';

  private typeSelectName = 'type_id';
  private numberInputName = 'number';
  private explanationInputName = 'explanation';
  private explanationCyInputName = 'explanation_cy';
  private faxInputName = 'fax';
  private hiddenNewInputName = 'isNew';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getPostcodes();
        this.setUpPostcodesBtnClass();
        this.setUpSubmitEventHandler();
      }
    });
  }

  private getPostcodes(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/postcodes`,
      method: 'get',
      success: (res) => this.updateContent(res),
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET postcodes failed.')
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
        AjaxErrorHandler.handleError(response, 'POST add or move postcodes failed.'));
    });
  }

  private setUpPostcodesBtnClass(): void {
    $(this.tabId).on('click', `button.${this.addPostcodesNumBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenPostcodesNumTemplateId}`;
      const copyFieldset = $(selector).clone()
        .removeAttr('disabled')
        .removeAttr('hidden')
        .removeAttr('id');
      $(selector).before(copyFieldset);

      // Set the id and names of the elements in the table
      this.renameFormElements();
    });
  }

  private getInputName(name: string, index: number): string {
    return `postcodes[${index}][${name}]`;
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
  }

  private renameFormElement(elementType: string, name: string): void {
    $(`${this.tabId} ${elementType}[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(`${name}`, idx))
      .attr('id', idx => `${name}-` + idx);
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    initAll({ scope: document.getElementById('postcodesTab')});
  }
}
