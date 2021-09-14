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

    $(this.auditsSearchForm).on('submit', e => {
      e.preventDefault();

      const formData = $(this.auditsSearchForm).serializeArray() as any;
      console.log(formData);
      console.log(formData['searchLocation']);


      const page = 1;
      const size = 10;
      const courtLocation = 'abc';
      const email = '';
      const dateFrom = '';
      const dateTo = '';

      this.getAuditContent(page, size, courtLocation, email, dateFrom, dateTo);

    });
  }

}
