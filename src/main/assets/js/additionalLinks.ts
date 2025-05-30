import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
import {setUpTabClick} from './tab-reset';

export class AdditionalLinksController {
  private formId = '#additionalLinksForm';
  private tabId = '#additionalLinksTab';
  private additionalLinksContentContentId = '#additionalLinksContent';
  private hiddenNewAdditionalLinkTemplateId = '#newAdditionalLinkTemplate';

  private addBtnClass = 'addAdditionalLink';
  private deleteBtnClass = 'deleteAdditionalLink';
  private clearBtnClass = 'clearAdditionalLink';
  private moveUpBtnClass = 'move-up';
  private moveDownBtnClass = 'move-down';

  private urlInputName = 'url';
  private displayNameInputName = 'display_name';
  private displayNameCyInputName = 'display_name_cy';
  private hiddenNewInputName = 'isNew';
  private tab = '#tab_additional-links';
  private header = 'header';

  constructor() {
    this.initialise();
  }

  private initialise(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getCourtAdditionalLinks.bind(this));
        this.getCourtAdditionalLinks();
        this.setUpSubmitEventHandler();
        this.setUpAddEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
        Utilities.addFieldsetReordering(this.tabId, this.moveUpBtnClass, this.moveDownBtnClass, this.renameFormElements.bind(this));
      }
    });
  }

  private getCourtAdditionalLinks(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/additionalLinks`,
      method: 'get',
      success: (res) => {
        $(this.additionalLinksContentContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court additional links failed.')
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
        $(this.additionalLinksContentContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT court additional links failed.'));
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenNewAdditionalLinkTemplateId}`;
      const copyFieldset = $(selector).clone()
        .removeAttr('disabled')
        .removeAttr('hidden')
        .removeAttr('id');
      $(selector).before(copyFieldset);
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
    $(this.tabId).on('click', `button.${this.clearBtnClass}`, e => {
      $(e.target.closest('fieldset')).find(':input:visible').val('');
    });
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameInputElement(this.urlInputName, this.urlInputName);
    this.renameInputElement(this.displayNameInputName, this.displayNameInputName);
    this.renameInputElement(this.displayNameCyInputName, this.displayNameCyInputName);
    this.renameInputElement(this.hiddenNewInputName, this.hiddenNewInputName);
    this.renameHeader(this.header);
    this.renameButtonAriaLabel('moveUp', 'move up');
    this.renameButtonAriaLabel('moveDown', 'move down');
    this.renameActionButtonAriaLabel('actionOnAdditionalLink');
  }

  private renameInputElement(name: string, id: string): void {
    $(`${this.tabId} input[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('id', idx => `${id}-${idx}`)
      .siblings('label').attr('for', idx => `${id}-${idx}`);
  }

  private renameHeader(name: string): void {
    // replace the index within the header.
    $(`${this.tabId} h3[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .text(idx => `Add New Additional Link ${idx+1}`);
  }

  private renameButtonAriaLabel(name: string, labelText: string): void {
    // replace the index within the aria label.
    $(`${this.tabId} button[name$="[${name}]"]`)
      .attr('name', idx => this.getInputName(name, idx))
      .attr('aria-label', idx => `${labelText} additional link ${idx+1}`);
  }

  private renameActionButtonAriaLabel(name: string): void {
    // replace the index within the aria label for remove and clear buttons.
    $(`${this.tabId} button[name$="[${name}]"]`).each(function (idx) {
      const buttonText = $(this).text().toLowerCase();
      let newAriaLabel;

      if(buttonText.includes('clear')) {
        newAriaLabel = `clear additional link ${idx+1}`;
      } else if (buttonText.includes('remove')) {
        newAriaLabel = `remove additional link ${idx+1}`;
      } else {
        newAriaLabel = `action additional link ${idx+1}`;
      }
      $(this).attr('aria-label', newAriaLabel);
    });
  }

  private getInputName(name: string, index: number): string {
    return `additionalLinks[${index}][${name}]`;
  }
}
