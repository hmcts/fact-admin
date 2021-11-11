import $ from 'jquery';
import {AjaxErrorHandler} from '../ajaxErrorHandler';

const { initAll } = require('govuk-frontend');


export class InviteUserController {

  private formId = '#inviteUserForm';
  private tabId = '#inviteUserTab';
  private inviteUserContentId = '#inviteUserContent';
  private confirmBtnId = '#confirmInvite';
  private cancelChangesClass = 'cancel-changes';
  private clearInviteUserBtnClass = 'clear-changes';


  constructor() {
    this.initialize();

  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpInviteEventHandler();
        this.setUpConfirmEventHandler();
        this.setUpCancelEventHandler();
        this.setUpClearEventHandler();
      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {

    $(contentId).html(content);
    initAll({scope: document.getElementById('inviteUserTab')});

  }

  private get(): void{
    $.ajax({
      url: '/users/invite/user',
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.inviteUserContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET invite user failed.')
    });

  }

  private setUpInviteEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const url = '/users/invite/user';
      $.ajax({
        url: url,
        method: 'post',
        data: $(e.target).serialize()
      }).done( async res => {
        await this.updateContent(res, this.inviteUserContentId);
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
    $(this.tabId).on('click', `.${this.cancelChangesClass}`, e => {
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
      await this.updateContent(res, this.inviteUserContentId);
      window.scrollTo(0, 0);
    }).fail(response =>
      AjaxErrorHandler.handleError(response, 'POST confirm user failed.'));
  }


}

