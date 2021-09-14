import $ from 'jquery';
import tinymce from 'tinymce';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class FacilitiesController {
  private formId = '#courtFacilitiesForm';
  private tabId = '#courtFacilitiesTab';
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
  }

  private getCourtFacilities(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/facilities`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res);
        window.scrollTo(0, 0);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court facilities failed.')
    });
  }

  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      tinymce.triggerSave();
      const url = $(e.target).attr('action');
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(async res => {
        await this.updateContent(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST facilities failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addFacilityBtnClass}`, e => {
      e.preventDefault();
      tinymce.triggerSave();

      // Call the service to re-create the view with a new empty row
      $.ajax({
        url: '/courts/facilities/add-row',
        method: 'put',
        data: $(this.formId).serialize()
      }).done(async res => {
        await this.updateContent(res);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'add new facility row failed.'));
    });
  }

  private setUpClearEventHandler(): void {
    $(this.tabId).on('click', `button.${this.clearFacilityBtnClass}`, e => {
      $(e.target.closest('fieldset')).find(':input:visible').val('');

      const idIndex = $(tinymce.activeEditor.selection.getNode()).closest('body').data('id').split('-').pop();
      tinymce.get(this.description + '-' + idIndex).setContent('');
      tinymce.get(this.descriptionCy + '-' + idIndex).setContent('');
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button.${this.deleteBtnClass}`, e => {
      e.target.closest('fieldset').remove();
      this.renameFormElements();
    });
  }

  private getInputName(name: string, index: number): string {
    return `courtFacilities[${index}][${name}]`;
  }

  private getInputId(id: string, index: number): string {
    return `${id}-${index}`;
  }

  private renameFormElement(type: 'input' | 'select' | 'textarea', name: string, id: string): void {
    $(`${this.tabId} ${type}[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx + 1))
      .attr('id', idx => this.getInputId(id, idx + 1))
      .siblings('label').attr('for', idx => this.getInputId(id, idx + 1));
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameFormElement('select', this.facilityName, this.facilityName);
    this.renameFormElement('textarea', this.description, this.description);
    this.renameFormElement('textarea', this.descriptionCy, this.descriptionCy);
    this.renameFormElement('input', this.hiddenNewInputName, this.hiddenNewInputName);
  }
}