import $ from 'jquery';
import {AjaxErrorHandler} from '../ajaxErrorHandler';

const { initAll } = require('govuk-frontend');


export class EditUserController {

  private searchFormId = '#searchUserForm';
  private searchTabId = '#searchUserTab';
  private searchUserContentId = '#searchUserContent';
  private cancelEditButtonId = '#cancelEditUserBtn'
  private submitEditButtonId = '#submitEditUserBtn'
  private deleteUserButtonId = '#deleteUserBtn'
  private deleteConfirmBtnId = '#confirmDeleteUserBtn'

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.searchTabId).length > 0) {
        this.get();
        this.setUpSearchEventHandler();
        this.setUpCancelEventHandler();
        this.setUpUpdateEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpDeleteConfirmEventHandler();
      }
    });
  }

  private async updateContent(content: any, contentId: string): Promise<void> {
    $(contentId).html(content);

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

  private setUpUpdateEventHandler(): void {
    $(this.searchFormId).on('click', `${this.submitEditButtonId}`, e => {
      e.preventDefault();
      const userId = $('#user-id').val();
      const userEmail = $('#user-email').val();
      const forename = $('#forename').val();
      const surname = $('#surname').val();
      const role = this.getUserRole();
      $.ajax({
        url: '/users/update/user',
        method: 'patch',
        data: {
          userId: userId,
          userEmail: userEmail,
          forename: forename,
          surname: surname,
          role: [
            {
              'name': role
            }
          ]
        }
      }).done(res => {
        this.updateContent(res, this.searchUserContentId);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PATCH user details failed.'));
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.searchFormId).on('click', `${this.deleteUserButtonId}`, e => {
      e.preventDefault();
      const userId = $('#user-id').val();
      const userEmail = $('#user-email').val();
      $.ajax({
        url: '/users/confirm-delete/user/',
        method: 'get',
        data: {
          'userEmail': userEmail,
          'userId': userId
        }
      }).done(res => {
        this.updateContent(res, this.searchUserContentId);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'DELETE user failed.'));
    });
  }

  private setUpDeleteConfirmEventHandler(): void {
    $(this.searchFormId).on('click', `${this.deleteConfirmBtnId}`, e => {
      e.preventDefault();
      const userId = $('#user-id').val();

      $.ajax({
        url: `/users/delete/user/${userId}`,
        method: 'delete',
      }).done(res => {
        this.updateContent(res, this.searchUserContentId);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'DELETE user failed.'));
    });
  }

  private setUpCancelEventHandler(): void {
    $(this.searchFormId).on('click', `${this.cancelEditButtonId}`, e => {
      e.preventDefault();
      this.get();
    });
  }

  private getUserRole(): string {
    if ($('#userRole-2').prop('checked')) {
      return $('#userRole-2').val() as string;
    } else return $('#userRole').val() as string;
  }

}


