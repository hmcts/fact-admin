import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
import {setUpTabClick} from './tab-reset';

const { initAll } = require('govuk-frontend');

export class CourtTypesController {
  private formId = '#courtTypesForm';
  private localAuthoritiesId = '#localAuthoritiesTab';
  private tabId = '#courtTypesTab';
  private postcodesTabId = '#postcodesTab';
  private courtTypesContentId = '#courtTypesContent';
  private localAuthoritiesContentId = '#localAuthoritiesContent';
  private localAuthoritiesTabId ='#tab_local-authorities';
  private postcodesNavTab = '#tab_postcodes';

  private deleteBtnClass = 'deleteDxCode';
  private hiddenDxCodesTemplateId = '#newDxCodeTemplate';
  private addDxCodeBtnClass = 'addDxCode';
  private clearDxCodeBtnClass = 'clearDxCode';

  private codeInputName = 'code';
  private explanationInputName = 'explanation';
  private explanationCyInputName = 'explanationCy';
  private tab = '#tab_court-types';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getCourtTypes.bind(this));
        this.getCourtTypes();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({ scope: document.getElementById('courtTypesTab') });
    initAll({scope: document.getElementById('localAuthoritiesTab')});
  }

  private getCourtTypes(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/court-types`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res,this.courtTypesContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court types failed.')
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
      }).done( async res => {
        await this.updateContent(res, this.courtTypesContentId);
        window.scrollTo(0, 0);
        this.getAreasOfLaw();
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST court types failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addDxCodeBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenDxCodesTemplateId}`;
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
    $(this.tabId).on('click', `button.${this.clearDxCodeBtnClass}`, e => {
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
    return `dxCodes[${index}][${name}]`;
  }

  private renameFormElement(type: 'input', name: string, id: string): void {
    $(`${this.tabId} ${type}[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('id', idx => `${id}-` + idx)
      .siblings('label').attr('for', idx => `${id}-` + idx);
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameFormElement('input', this.codeInputName, this.codeInputName);
    this.renameFormElement('input', this.explanationInputName, this.explanationInputName);
    this.renameFormElement('input', this.explanationCyInputName, this.explanationCyInputName);
    this.renameButtonAriaLabel('moveUp', 'move up');
    this.renameButtonAriaLabel('moveDown', 'move down');
    this.renameActionButtonAriaLabel('actionOnCourtType');
  }

  private renameButtonAriaLabel(name: string, labelText: string): void {
    // replace the index within the aria label.
    $(`${this.tabId} button[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('aria-label', idx => `${labelText} dx code ${idx+1}`);
  }

  private renameActionButtonAriaLabel(name: string): void {
    // replace the index within the aria label for remove and clear buttons.
    $(`${this.tabId} button[name$="[${name}]"]`).each(function (idx) {
      const buttonText = $(this).text().toLowerCase();
      let newAriaLabel;

      if(buttonText.includes('clear')) {
        newAriaLabel = `clear court type ${idx+1}`;
      } else if (buttonText.includes('remove')) {
        newAriaLabel = `remove court type ${idx+1}`;
      } else {
        newAriaLabel = `action court type ${idx+1}`;
      }
      $(this).attr('aria-label', newAriaLabel);
    });
  }

  //added below methods to make sure local authorities tabs is enabled and disabled when family court type is updated.
  private getAreasOfLaw(): void{
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/local-authorities-areas-of-law`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.localAuthoritiesContentId);
        this.toggleTabs();
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET local authorities areas of law failed.')
    });
  }

  // In the event that the court type is updated, enable/disable the tab and also the data within
  private toggleTabs(): void {
    // Postcodes
    Utilities.toggleTabEnabled(this.postcodesNavTab,
      Utilities.isCheckboxItemSelected('#courtTypesContent input[name="types"]', 'County Court'));
    Utilities.toggleTabEnabled(this.postcodesTabId,
      Utilities.isCheckboxItemSelected('#courtTypesContent input[name="types"]', 'County Court'));

    // Local authorities
    Utilities.toggleTabEnabled(this.localAuthoritiesTabId, $('#enabled').val() === 'true');
    Utilities.toggleTabEnabled(this.localAuthoritiesId,
      Utilities.isCheckboxItemSelected('#courtTypesContent input[name="types"]', 'Family Court'));
  }
}
