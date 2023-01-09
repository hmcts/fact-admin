import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class AuditController {

  private auditsSearchForm = '#auditsSearchForm';
  private auditsPageContent = '#auditsPageContent';
  private auditsPageId = 'auditsPageId';
  private auditsPageNext = '#auditNext';
  private auditsPagePrev = '#auditPrevious';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.auditsPageContent).length > 0) {
        this.getAuditContent(0, 10, {});
        this.setUpSearchSubmitEventHandler();
      }
    });
  }

  private getAuditContent(page: number, size: number, dataObj: {}): void{

    $.ajax({
      url: `/audit-data?page=${page}&size=${size}&${dataObj}`,
      method: 'get',
      success: async (res) => {
        await $(this.auditsPageContent).html(res);
        await initAll({scope: document.getElementById(this.auditsPageId)});

        // The events need to be binded after the page changes have been loaded in
        this.setUpAuditNextPageHandler();
        this.setUpAuditPreviousPageHandler();
        window.scrollTo(0, 0);
      },
      error: (jqxhr) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET audits failed.')
    });
  }

  private setUpAuditPreviousPageHandler(): void {
    $(this.auditsPagePrev).on('click', async e => {
      e.preventDefault();
      const page = $('#currentPage').val() as number;
      await this.getAuditContent(page == 0 ? 0 : page -1, 10, $(this.auditsSearchForm).serialize());
    });
  }

  private setUpAuditNextPageHandler(): void {
    $(this.auditsPageNext).on('click', async e => {
      e.preventDefault();
      await this.getAuditContent(parseInt($('#currentPage').val() as string) + 1, 10,
        $(this.auditsSearchForm).serialize());
    });
  }

  private setUpSearchSubmitEventHandler(): void {

    $(this.auditsSearchForm).on('submit', async e => {
      e.preventDefault();
      await this.getAuditContent(0, 10, $(this.auditsSearchForm).serialize());
    });
  }
}
