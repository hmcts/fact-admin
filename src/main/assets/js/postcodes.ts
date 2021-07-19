import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';

const { initAll } = require('govuk-frontend');

export class PostcodesController {

  private tabId = '#postcodesTab';
  private postcodesNavTab = '#tab_postcodes'
  private postcodesContentId = '#postcodesContent';
  private movePostcodesSelectId = '#movePostcodesSelect';
  private addPostcodesBtnClass = 'addPostcodes';
  private movePostcodesBtnClass = 'movePostcodesButton';
  private selectAllPostcodes = 'postcodesSelectAllItems';
  private deletePostcodesBtnClass = 'deletePostcodes';
  private static existingPostcodesInputId = '#existingPostcodesInput';
  private static courtTypesInputId = '#courtTypesInput';
  private static areasOfLawInputId = '#areasOfLawInput';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        Utilities.toggleTabEnabled(this.tabId, false);
        this.getPostcodes();
        this.setUpAddEventHandler();
        this.setUpSelectAllEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpMoveEventHandler();
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
      error: (jqxhr) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET postcodes failed.')
    });
  }

  private setUpAddEventHandler(): void {
    $(this.tabId).on('click', `button.${this.addPostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      const requestBodyData = PostcodesController.getRequestBodyData();
      requestBodyData['newPostcodes'] = $('#addNewPostcodes').val();

      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'post',
        data: requestBodyData
      }).done(res => {
        this.updateContent(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST new postcodes failed.'));
    });
  }

  private setUpMoveEventHandler(): void {
    $(this.tabId).on('click', `button.${this.movePostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      const requestBodyData = PostcodesController.getRequestBodyData();
      requestBodyData['selectedCourt'] = $(this.movePostcodesSelectId).val();

      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'put',
        data: requestBodyData
      }).done(res => {
        this.updateContent(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT (move) postcodes failed.'));
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button.${this.deletePostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'delete',
        data: PostcodesController.getRequestBodyData()
      }).done(res => {
        this.updateContent(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'DELETE postcodes failed.'));
    });
  }

  private setUpSelectAllEventHandler(): void {
    $(this.tabId).on('change', `input[name=${this.selectAllPostcodes}]`, e => {
      e.preventDefault();
      // Switch between selecting checked on all (when ticked) and unchecked on all (when not ticked)
      $('#postcodesList input[name="postcodesCheckboxItems"]').prop('checked',
        $('#postcodeSelectAll input[name="postcodesSelectAllItems"]').prop('checked'));
    });
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    Utilities.toggleTabEnabled(this.postcodesNavTab, $('#postcodesEnabled').val()  === 'true');
    Utilities.toggleTabEnabled(this.tabId, $('#postcodesEnabled').val()  === 'true');
    initAll({ scope: document.getElementById('postcodesTab')});
  }

  private static getRequestBodyData(): any {
    return {
      existingPostcodes: $(this.existingPostcodesInputId).val(),
      selectedPostcodes: Utilities.getSelectedItemsIds($('#postcodesList input[name="postcodesCheckboxItems"]')),
      csrfToken: $('#postcodesTab input[name="_csrf"]').val(),
      courtTypes: $(this.courtTypesInputId).val(),
      areasOfLaw: $(this.areasOfLawInputId).val()
    };
  }
}
