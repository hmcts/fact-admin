import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class PostcodesController {

  private tabId = '#postcodesTab';
  private postcodesContentId = '#postcodesContent';
  private addPostcodesBtnClass = 'addPostcodes';
  private addNewPostcodesInput = 'addNewPostcodes';
  private existingPostcodesInput = 'existingPostcodesInput';
  private selectAllPostcodes = 'postcodesSelectAllItems';
  private selectPostcodes = 'postcodesCheckboxItems';
  private postcodesCheckboxItems = 'postcodesCheckboxItems';
  private deletePostcodesBtnClass = 'deletePostcodes';
  private csrfTokenName = '_csrf';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getPostcodes();
        this.setUpAddEventHandler();
        this.setUpSelectAllEventHandler();
        this.setUpDeleteEventHandler();
      }
    });
  }

  private getPostcodes(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/postcodes`,
      method: 'get',
      success: (res) => {
        this.updateContent(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET postcodes failed.')
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addPostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'post',
        data: {
          existingPostcodes: $(document.getElementById(this.existingPostcodesInput)).val(),
          newPostcodes: $(document.getElementById(this.addNewPostcodesInput)).val(),
          csrfToken: $(document.getElementsByName(this.csrfTokenName)).val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST new postcodes failed.'));
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button.${this.deletePostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'delete',
        data: {
          existingPostcodes: $(document.getElementById(this.existingPostcodesInput)).val(),
          selectedPostcodes: this.getSelectedItems($(document.getElementsByName(this.selectPostcodes))),
          csrfToken: $(document.getElementsByName(this.csrfTokenName)).val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'DELETE postcodes failed.'));
    });
  }

  /**
   *
   * Return a list of postcodes (in this case) that have been selected
   * @param elementList a list of checked boxes
   * @private
   */
  private getSelectedItems(elementList: JQuery): string[] {
    return $.map(elementList, function(value: HTMLElement){
      if ($(value).prop('checked')) {
        return [value.id];
      }
    });
  }

  private setUpSelectAllEventHandler(): void {
    $(this.tabId).on('change', `input[name=${this.selectAllPostcodes}]`, e => {
      e.preventDefault();
      // Switch between selecting checked on all (when ticked) and unchecked on all (when not ticked)
      const toggle = $(document.getElementsByName(this.selectAllPostcodes)).prop('checked');
      $(document.getElementsByName(this.postcodesCheckboxItems)).prop('checked', toggle);
    });
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    initAll({ scope: document.getElementById('postcodesTab')});
  }
}
