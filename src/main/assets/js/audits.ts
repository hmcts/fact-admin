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
        console.log('registered this view');
        this.getAuditContent(0, 10, '', '', '', '');
        this.setUpSearchSubmitEventHandler();
      }
    });
  }

  private getAuditContent(page: number, size: number, courtLocation: string, email: string, dateFrom: string, dateTo: string): void{

    $.ajax({
      url: `/audit-data?page=${page}&size=${size}&location=${courtLocation}&email=${email}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
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
      const dataObj = this.getFormAndPageData();

      const username = dataObj['searchUser'];
      const location = dataObj['searchLocation'];
      const dateFrom = dataObj['searchDateFrom'];
      const dateTo = dataObj['searchDateTo'];
      const page = $('#currentPage').val() as number;

      await this.getAuditContent(page == 0 ? 0 : page -1, 10,
        location == 'select-court' ? '' : location,
        username, dateFrom, dateTo);
    });
  }

  private setUpAuditNextPageHandler(): void {
    $(this.auditsPageNext).on('click', async e => {
      e.preventDefault();
      const dataObj = this.getFormAndPageData();

      const username = dataObj['searchUser'];
      const location = dataObj['searchLocation'];
      const dateFrom = dataObj['searchDateFrom'];
      const dateTo = dataObj['searchDateTo'];

      await this.getAuditContent(parseInt($('#currentPage').val() as string) + 1, 10,
        location == 'select-court' ? '' : location,
        username, dateFrom, dateTo);
    });
  }

  private setUpSearchSubmitEventHandler(): void {

    $(this.auditsSearchForm).on('submit', async e => {
      e.preventDefault();

      const dataObj = this.getFormAndPageData();

      const username = dataObj['searchUser'];
      const location = dataObj['searchLocation'];
      const dateFrom = dataObj['searchDateFrom'];
      const dateTo = dataObj['searchDateTo'];

      await this.getAuditContent(0, 10, location == 'select-court' ? '' : location,
        username, dateFrom, dateTo);
    });
  }

  private getFormAndPageData(): any {
    const formData = $(this.auditsSearchForm).serializeArray() as any, dataObj = {} as any;

    $(formData).each(function(i, field){
      dataObj[field.name] = field.value;
    });

    return dataObj;
  }
}
