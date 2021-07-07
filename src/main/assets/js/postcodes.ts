import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';

const { initAll } = require('govuk-frontend');

export class PostcodesController {

  private tabId = '#postcodesTab';
  private postcodesNavTab = '#tab_postcodes'
  private postcodesContentId = '#postcodesContent';
  private addPostcodesBtnClass = 'addPostcodes';
  private movePostcodesBtnClass = 'movePostcodesButton';
  private selectAllPostcodes = 'postcodesSelectAllItems';
  private deletePostcodesBtnClass = 'deletePostcodes';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        Utilities.toggleTabEnabled(this.postcodesNavTab, false);
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
          existingPostcodes: $('[name="existingPostcodesInput"]').val(),
          newPostcodes: $('[id="addNewPostcodes"]').val(),
          csrfToken: $('[name="_csrf"]').val(),
          courtTypes: $('[name="courtTypesInput"]').val(),
          areasOfLaw: $('[name="areasOfLawInput"]').val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST new postcodes failed.'));
    });
  }

  private setUpMoveEventHandler(): void {
    $(this.tabId).on('click', `button.${this.movePostcodesBtnClass}`, e => {
      e.preventDefault();
      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/postcodes`,
        method: 'put',
        data: {
          existingPostcodes: $('[name="existingPostcodesInput"]').val(),
          selectedPostcodes: Utilities.getSelectedItemsIds($('[name="postcodesCheckboxItems"]')),
          selectedCourt: $('[name="movePostcodesSelect"]').val(),
          csrfToken: $('[name="_csrf"]').val(),
          courtTypes: $('[name="courtTypesInput"]').val(),
          areasOfLaw: $('[name="areasOfLawInput"]').val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
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
        data: {
          existingPostcodes: $('[name="existingPostcodesInput"]').val(),
          selectedPostcodes: Utilities.getSelectedItemsIds($('[name="postcodesCheckboxItems"]')),
          csrfToken: $('[name="_csrf"]').val(),
          courtTypes: $('[name="courtTypesInput"]').val(),
          areasOfLaw: $('[name="areasOfLawInput"]').val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'DELETE postcodes failed.'));
    });
  }

  private setUpSelectAllEventHandler(): void {
    $(this.tabId).on('change', `input[name=${this.selectAllPostcodes}]`, e => {
      e.preventDefault();
      // Switch between selecting checked on all (when ticked) and unchecked on all (when not ticked)
      $('[name="postcodesCheckboxItems"]').prop('checked',
        $('[name="postcodesSelectAllItems"]').prop('checked'));
    });
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    Utilities.toggleTabEnabled(this.postcodesNavTab, $('[name="postcodesEnabled"]').val()  === 'true');
    initAll({ scope: document.getElementById('postcodesTab')});
  }
}
