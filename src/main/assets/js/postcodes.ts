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
  private postcodesCheckboxItems = 'postcodesCheckboxItems';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getPostcodes();
        this.setUpAddEventHandler();
        this.setUpSelectAllEventHandler();
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
          csrfToken: $(document.querySelector('#postcodesTab > input[type=hidden]')).val()
        }
      }).done(res => {
        $(this.postcodesContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST new postcodes failed.'));
    });
  }

  private setUpSelectAllEventHandler(): void {
    $(this.tabId).on('change', `input[name=${this.selectAllPostcodes}]`, e => {
      e.preventDefault();
      const selectAll = document.getElementsByName(this.selectAllPostcodes)[0];
      const ele = document.getElementsByName(this.postcodesCheckboxItems);

      if (selectAll.hasAttribute('checked')) {
        console.log('in checked');
        (selectAll as HTMLInputElement).checked = false;
        for(let i=0; i<3; i++) {
          (ele[i] as HTMLInputElement).checked = null;
          console.log('select all:' + selectAll.getAttribute('checked'));
          console.log('postcode:' + ele[i].outerHTML + ele[i].innerHTML);
        }
      } else {
        console.log('in unchecked');
        (selectAll as HTMLInputElement).checked = true;
        for(let i=0; i<3; i++) {
          (ele[i] as HTMLInputElement).checked = true;
          console.log('select all:' + selectAll.getAttribute('checked'));
          console.log('postcode:' + ele[i].outerHTML + ele[i].innerHTML);
        }
      }
    });
  }

  private updateContent(res: any): void {
    $(this.postcodesContentId).html(res);
    initAll({ scope: document.getElementById('postcodesTab')});
  }
}
