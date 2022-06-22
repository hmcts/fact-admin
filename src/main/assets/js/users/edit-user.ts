import $ from 'jquery';
import {AjaxErrorHandler} from '../ajaxErrorHandler';

const { initAll } = require('govuk-frontend');


export class EditUserController {

  private searchFormId = '#searchUserForm';
  private searchTabId = '#searchUserTab';
  private searchUserContentId = '#searchUserContent';
  private cancelEditButtonId = '#cancelEditUserBtn'
  private submitEditButtonId = '#submitEditUserBtn'
  private deleteUserButtonId = '#deleteUserRolesBtn'
  private deleteConfirmBtnId = '#confirmDeleteUserRolesBtn'

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
      const userEmail = $('#search-user-email').val();
      $.ajax({
        url: `/users/search/${userEmail}`,
        method: 'get'
      }).done(res => {
        this.updateContent(res, this.searchUserContentId);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'GET user failed.'));
    });
  }

  private setUpUpdateEventHandler(): void {
    $(this.searchFormId).on('click', `${this.submitEditButtonId}`, e => {
      e.preventDefault();
      const userEmail = $('#edit-user-email').val();
      const forename = $('#edit-forename').val();
      const surname = $('#edit-surname').val();
      const role = this.getUserRole();
      $.ajax({
        url: '/users/update/user',
        method: 'patch',
        data: {
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
      const userEmail = $('#user-email').val();
      const role = this.getUserRole();
      $.ajax({
        url: '/users/confirm-delete/user/',
        method: 'get',
        data: {
          'userEmail': userEmail,
          'userRole': role
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
      const userRole = $('#user-role').val();
      const userEmail = $('#user-email').val();
      $.ajax({
        url: '/users/delete/user/',
        data: {
          'userRole': userRole,
          'userEmail': userEmail
        },
        method: 'delete'
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
    } else if ($('#userRole').prop('checked')) {
      return $('#userRole').val() as string;
    } else return '';
  }

}


