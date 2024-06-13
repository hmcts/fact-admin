import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';
import {setUpTabClick} from './tab-reset';

export class CourtHistoryController {
  private formId = '#courtHistoryForm';
  private tabId = '#courtHistoryTab';
  private courtHistoryContentId = '#courtHistoryContent';
  private hiddenNewCourtHistoryTemplateId = '#newCourtHistoryTemplate';

  private deleteBtnClass = 'deleteCourtHistory';
  private addCourtHistoryBtnClass = 'addCourtHistory';
  private clearCourtHistoryBtnClass = 'clearCourtHistory';
  private moveUpBtnClass = 'move-up';
  private moveDownBtnClass = 'move-down';

  private courtNameInputName = 'court_name';
  private courtNameCyInputName = 'court_name_cy';
  private hiddenNewInputName = 'isNew';
  private tab = '#tab_courtHistory';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log('initalize hit!');
    $(() => {
      if ($(this.tabId).length > 0) {
        console.log(1);
        setUpTabClick(this.tab, this.getCourtHistory.bind(this));
        console.log(2);
        this.getCourtHistory();
        console.log(3);
        this.setUpSubmitEventHandler();
        console.log(4);
        this.setUpAddEventHandler();
        console.log(5);
        this.setUpDeleteEventHandler();
        this.setUpClearEventHandler();
        Utilities.addFieldsetReordering(this.tabId, this.moveUpBtnClass, this.moveDownBtnClass, this.renameFormElements.bind(this));
      }
    });
  }

  private getCourtHistory(): void {
    const slug = $('#slug').val();
    console.log('slug: ' + slug);

    $.ajax({
      url: `/courts/${slug}/history`,
      method: 'get',
      success: (res) => {
        $(this.courtHistoryContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET court history failed.')
        console.log('========error getting court history=======');
        console.log(jqxhr);
        console.log(errorTextStatus);
        console.log(err);
        console.log('==========================================');
      }
    });
  }

  // By default this will be used when the save button is pressed
  private setUpSubmitEventHandler(): void {
    console.log('put hit!');
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const url = $(e.target).attr('action');
      console.log('url: ' + url);
      console.log('serialized: ' + $(e.target));

      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(res => {
        $(this.courtHistoryContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response => {
        console.log('========error putting court history=======');
        console.log(response);
        AjaxErrorHandler.handleError(response, 'PUT court history failed.')
      });
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addCourtHistoryBtnClass}`, e => {
      // Copy hidden template to main table for adding new entry, removing hidden and ID attributes
      const selector = `${this.tabId} ${this.hiddenNewCourtHistoryTemplateId}`;
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
    $(this.tabId).on('click', `button.${this.clearCourtHistoryBtnClass}`, e => {
      $(e.target.closest('fieldset')).find(':input:visible').val('');
    });
  }

  private static getInputName(name: string, index: number): string {
    return `courtHistory[${index}][${name}]`;
  }

  private renameFormElements(): void {
    // Rename the input fields so that the index values are in order,
    // which affects the order when the form is posted.
    this.renameInputElement(this.courtNameInputName, this.courtNameInputName);
    this.renameInputElement(this.courtNameCyInputName, this.courtNameCyInputName);
    this.renameInputElement(this.hiddenNewInputName, this.hiddenNewInputName);
  }

  private renameInputElement(attributeInputName: string, attributeInputId: string): void {
    $(`${this.tabId} input[name$="[${attributeInputName}]"]`)
      .attr('name', idx => CourtHistoryController.getInputName(attributeInputName, idx))
      .attr('id', idx => `${attributeInputId}-${idx}`)
      .siblings('label').attr('for', idx => `${attributeInputId}-${idx}`);
  }
}
