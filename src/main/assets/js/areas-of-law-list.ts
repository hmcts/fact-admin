import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class AreasOfLawListController {

  private tabId = '#areasOfLawListTab';
  private contentId = '#areasOfLawListContent';
  private formId = '#areasOfLawListForm';
  private cancelBtnId = '#cancelAreaOfLawChangesBtn';
  private editAolClass = 'edit-aol';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpEditEventHandler();
        this.setUpCancelEventHandler();
        this.setUpSubmitEventHandler();
      }
    });
  }

  private get(): void{
    $.ajax({
      url: '/lists/areas-of-law',
      method: 'get',
      success: async (res) => await this.updateContent(res, this.contentId),
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET areas of law failed.')
    });
  }

  private setUpEditEventHandler(): void {
    $(this.tabId).on('click', `a.${this.editAolClass}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).attr('href'),
        method: 'get',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'GET area of law failed.')
      });
    });
  }

  private setUpCancelEventHandler(): void {
    $(this.tabId).on('click', this.cancelBtnId, e => {
      this.get();
    });
  }

  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();

      const url = $(e.target).attr('action');
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done(res => this.updateContent(res, this.contentId))
        .fail(response =>
          AjaxErrorHandler.handleError(response, 'PUT area of law failed.'));
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({scope: document.getElementById('areasOfLawListTab')});
    window.scrollTo(0, 0);
  }
}
