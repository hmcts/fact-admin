import $ from 'jquery';
import {AjaxErrorHandler} from '../ajaxErrorHandler';

const { initAll } = require('govuk-frontend');


export class InviteUserController {

  private formId = '#inviteUserForm';
  private tabId = '#inviteUserTab';
  private inviteUserContentId = '#inviteUserContent';


  constructor() {
    this.initialize();

  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpSubmitEventHandler();

      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {

    $(contentId).html(content);
    initAll({scope: document.getElementById('inviteUserTab')});

  }

  private get(): void{
    $.ajax({
      url: `/account/invite-user`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.inviteUserContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET invite user of law failed.')
    });

  }

  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const url = `/account/invite-user`;
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
}
