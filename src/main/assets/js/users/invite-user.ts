import $ from 'jquery';
import {AjaxErrorHandler} from '../ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class InviteUserController {

  private formId = '#searchUserCreateForm';
  private tabId = '#inviteUserTab';
  private inviteUserSearchId = '#inviteUserSearchTab';
  private inviteUserSearchContentId = '#inviteUserSearchContent';
  //private inviteUserContentId = '#inviteUserContent';
  private confirmBtnId = '#confirmInvite';
  private cancelInviteButtonId = '#cancelInviteUserChangesBtn';
  private cancelEditButtonId = '#cancelEditUserBtn';
  private clearInviteUserBtnClass = 'clear-changes';
  private inviteUserButtonId = '#createUserChangesBtn';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.inviteUserSearchId).length > 0) {
        this.get();
        this.setUpSearchEventHandler();
        this.setUpInviteEventHandler();
        this.setUpConfirmEventHandler();
        this.setUpCancelEventHandler();
        this.setUpCancelEditEventHandler();
        this.setUpClearEventHandler();
      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);

    initAll({scope: document.getElementById('inviteUserSearchTab')});

    window.scrollTo(0, 0);
  }

  private get(): void{
    $.ajax({
      url: '/users/invite/search',
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.inviteUserSearchContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET search user failed.')
    });
  }

  private setUpSearchEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const userEmail = $('#user-email').val();
      $.ajax({
        url: '/users/invite/search/user',
        method: 'get',
        data: {
          'userEmail': userEmail
        }
      }).done(res => {
        this.updateContent(res, this.inviteUserSearchContentId);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'GET user failed.'));
    });
  }

  // private getInviteUser(): void{
  //   $.ajax({
  //     url: '/users/invite/user',
  //     method: 'get',
  //     success: async (res) => {
  //       await this.updateContent(res, this.inviteUserSearchContentId);
  //     },
  //     error: (jqxhr, errorTextStatus, err) =>
  //       AjaxErrorHandler.handleError(jqxhr, 'GET invite user failed.')
  //   });
  // }

  private setUpInviteEventHandler(): void {
    $(this.formId).on('click', `${this.inviteUserButtonId}`, e => {
      e.preventDefault();
      const url = '/users/invite/user';
      const email = $('#invite-email').val();
      const forename = $('#invite-forename').val();
      const surname = $('#invite-surname').val();
      const role = this.getUserRole();
      $.ajax({
        url: url,
        method: 'post',
        data: {
          _csrf: $("[name='_csrf']").val(),
          user: {
            email: email,
            forename: forename,
            surname: surname,
            roles: [role]
          }
        }
      }).done( async res => {
        await this.updateContent(res, this.inviteUserSearchContentId);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST invite user failed.'));
    });
  }

  private setUpConfirmEventHandler(): void {
    $(this.formId).on('click', `${this.confirmBtnId}`,  e => {
      e.preventDefault();

      $.ajax({
        url: '/getAccessToken',
        method: 'post',
        data: {password: $('#password').val()}
      }).done( async res => {
        await this.postUserInvite($('#user').val().toString(), $("[name='_csrf']").val().toString(), false);
      }).fail(async response =>
        await this.postUserInvite($('#user').val().toString(), $("[name='_csrf']").val().toString(), true));
    });
  }

  private setUpClearEventHandler(): void {
    $(this.tabId).on('click', `button.${this.clearInviteUserBtnClass}`, e => {
      e.preventDefault();
      location.reload();
    });
  }

  private setUpCancelEventHandler(): void {
    $(this.formId).on('click', `${this.cancelInviteButtonId}`, e => {
      e.preventDefault();
      this.get();
    });
  }

  private setUpCancelEditEventHandler(): void {
    $(this.formId).on('click', `${this.cancelEditButtonId}`, e => {
      e.preventDefault();
      this.get();
    });
  }

  private postUserInvite(user: string, csrf: string, error: boolean ): void {
    $.ajax({
      url: '/users/password',
      method: 'post',
      data: { user: user, _csrf: csrf, error: error}
    }).done( async res => {
      await this.updateContent(res, this.inviteUserSearchContentId);
      window.scrollTo(0, 0);
    }).fail(response =>
      AjaxErrorHandler.handleError(response, 'POST confirm user failed.'));
  }

  private getUserRole(): string {
    if ($('#inviteUserRoles-2').prop('checked')) {
      return $('#inviteUserRoles-2').val() as string;
    } else if ($('#inviteUserRoles').prop('checked')) {
      return $('#inviteUserRoles').val() as string;
    } else return '';
  }
}
