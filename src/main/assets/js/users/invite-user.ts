import $ from 'jquery';
import {AjaxErrorHandler} from '../ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class InviteUserController {

  private formId = '#inviteUserSearchForm';
  private tabId = '#inviteUserSearchTab';
  private inviteUserSearchContentId = '#inviteUserSearchContent';
  private editUserContentId = '#searchUserContent';
  private confirmBtnId = '#confirmInvite';
  private cancelInviteButtonId = '#cancelInviteUserChangesBtn';
  private inviteUserButtonId = '#createUserChangesBtn';
  private cancelConfirmBtnId = '#cancelConfirmChangesBtn';
  private createAnotherUserBtnId = '#inviteAnotherUser';
  private searchUserCreateBtnId = '#searchUserCreateBtn'
  private searchUserEditBtnId = '#searchUserEditBtn';


  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpSearchEventHandler();
        this.setUpEditEventHandler();
        this.setUpInviteEventHandler();
        this.setUpConfirmEventHandler();
        this.setUpCancelEventHandler();
        this.setUpCancelConfirmEventHandler();
        this.setUpInviteAnotherUserEventHandler();
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
    $(this.formId).on('click', `${this.searchUserCreateBtnId}`,e => {
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

  private setUpEditEventHandler(): void {
    $(this.formId).on('click', `${this.searchUserEditBtnId}`,e => {
      e.preventDefault();
      const userEmail = $('#user-email').val();
      $.ajax({
        url: `/users/search/${userEmail}`,
        method: 'get'
      }).done(res => {
        window.location.hash = '#edit-user';
        this.updateContent(res, this.editUserContentId);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'GET user failed.'));
    });
  }

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

  private setUpCancelEventHandler(): void {
    $(this.formId).on('click', `${this.cancelInviteButtonId}`, e => {
      e.preventDefault();
      this.get();
    });
  }

  private setUpCancelConfirmEventHandler(): void {
    $(this.formId).on('click', `${this.cancelConfirmBtnId}`, e => {
      e.preventDefault();
      this.get();
    });
  }

  private setUpInviteAnotherUserEventHandler(): void {
    $(this.formId).on('click', `${this.createAnotherUserBtnId}`, e => {
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
