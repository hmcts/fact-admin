import $ from 'jquery';
import tinymce from 'tinymce';
import {AjaxErrorHandler} from './ajaxErrorHandler';


const { initAll } = require('govuk-frontend');

export class FacilitiesController {
  private formId = '#courtFacilitiesForm';
  private tabId = '#courtFacilitiesTab';
  private hiddenFacilityTemplateId = '#newFacilityTemplate';
  private facilitiesContentId = '#courtFacilitiesContent';

  private deleteBtnClass = 'deleteFacility';
  private addFacilityBtnClass = 'addFacility';
  private clearFacilityBtnClass = 'clearFacility';

  private facilityName = 'name';
  private description = 'description';
  private descriptionCy = 'descriptionCy';
  private hiddenNewInputName = 'isNew';


  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getCourtFacilities();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
      }
    });
  }

  private async updateContent(content: any): Promise<void> {
    $(this.facilitiesContentId).html(content);

    tinymce.remove();
    await tinymce.init({
      selector: '.rich-editor',
      plugins: 'autolink link paste ',
      menubar: '',
      toolbar: 'link bold italic underline',
      height: 120,
      'paste_as_text': true,
      statusbar: false,
    });

    initAll({ scope: document.getElementById('courtFacilitiesTab') });

    window.scrollTo(0, 0);
  }



  private getCourtFacilities(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/facilities`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court facilities failed.')
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
      }).done(async res => {
        await this.updateContent(res);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST facilities failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addFacilityBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenFacilityTemplateId}`;
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
    $(this.tabId).on('click', `button.${this.clearFacilityBtnClass}`, e => {
      $(e.target.closest('fieldset')).find(':input,textarea:visible').val('');
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button.${this.deleteBtnClass}`, e => {
      e.target.closest('fieldset').remove();
      this.renameFormElements();
    });
  }

  private getInputName(name: string, index: number): string {
    return `facilities[${index}][${name}]`;
  }

  private renameFormElement(type: 'input' | 'select' | 'textarea', name: string, id: string): void {
    $(`${this.tabId} ${type}[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('id', idx => `${id}-` + idx)
      .siblings('label').attr('for', idx => `${id}-` + idx);
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameFormElement('select', this.facilityName, 'name');
    this.renameFormElement('textarea', this.description, this.description);
    this.renameFormElement('textarea', this.descriptionCy, this.descriptionCy);
    this.renameFormElement('input', this.hiddenNewInputName, this.hiddenNewInputName);
  }


}
