import $ from 'jquery';
import {AjaxErrorHandler} from '../ajaxErrorHandler';

const { initAll } = require('govuk-frontend');


export class EditUserController {

  private searchFormId = '#searchUserForm';
  private tabId = '#searchUserTab';
  private searchUserContentId = '#searchUserContent';


  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpSearchEventHandler();
      }
    });
  }

  private async updateContent(content: any, contentId: string): Promise<void> {
    $(this.searchUserContentId).html(content);

    initAll({ scope: document.getElementById('searchUserTab') });

    window.scrollTo(0, 0);
  }

  private get(): void{
    $.ajax({
      url: '/users/search/',
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.searchUserContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET search user failed.')
    });

  }

  private setUpSearchEventHandler(): void {
    $(this.searchFormId).on('submit', e => {
      e.preventDefault();
      const userEmail = $('#user-email').val();
      console.log('from javascript: ' + userEmail);
      $.ajax({
        url: '/users/search/user',
        method: 'get',
        data: {
          'userEmail': userEmail
        }
      }).done(res => {
        this.updateContent(res, this.searchUserContentId);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT cases heard failed.'));
    });
  }
}


