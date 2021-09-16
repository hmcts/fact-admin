import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

export class AuditController {

  private auditsSearchForm = '#auditsSearchForm';
  private auditsPageContent = '#auditsPageContent';

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
      },
      error: (jqxhr) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET audits failed.')
    });
  }

  private setUpSearchSubmitEventHandler(): void {

    $(this.auditsSearchForm).on('submit', async e => {
      e.preventDefault();

      const formData = $(this.auditsSearchForm).serializeArray() as any, dataObj = {} as any;

      $(formData).each(function(i, field){
        dataObj[field.name] = field.value;
      });

      const username = dataObj['searchUser'];
      const location = dataObj['searchLocation'];
      const dateFrom = dataObj['searchDateFrom'];
      const dateTo = dataObj['searchDateTo'];
      const page = $('#currentPage').val() as number;

      console.log('page ' + page);
      console.log('location ' + location);
      console.log('username ' + username);
      console.log('dateFrom ' + dateFrom);
      console.log('dateTo ' + dateTo);

      await this.getAuditContent(page, 10, location, username, dateFrom, dateTo);
    });
  }
}
