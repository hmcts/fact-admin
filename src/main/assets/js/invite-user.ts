import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');


export class InviteUserController {

  //private formId = '#localAuthoritiesForm';
  private tabId = '#inviteUserTab';
  private localAuthoritiesContentId = '#inviteUserContent';
  //private localAuthoritiesTabId ='#tab_local-authorities';


  constructor() {
    this.initialize();

  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getAreasOfLaw();

      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {

    $(contentId).html(content);
    initAll({scope: document.getElementById('inviteUserTab')});

  }

  private getAreasOfLaw(): void{
    $.ajax({
      url: `/account/invite-user`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.localAuthoritiesContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET invite user of law failed.')
    });

  }
}
