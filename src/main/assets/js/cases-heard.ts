import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

export class CasesHeardController {
  private formId = '#casesHeardForm';
  private tabId = '#casesHeardTab';
  private casesHeardContentId = '#casesHeardContent';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getCasesHeard();
        this.setUpUpdateEventHandler();
      }
    });
  }

  private getCasesHeard(): void {
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/cases-heard`,
      method: 'get',
      success: (res) => {
        $(this.casesHeardContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET cases heard failed.');
      }
    });
  }

  private setUpUpdateEventHandler(): void {
    // function getSelectedCasesHeard(elementList: JQuery): object[] {
    //   return $.map(elementList, function(value: HTMLElement){
    //     if ($(value).prop('checked')) {
    //       return { name: value.getAttribute('value'), id: value.id, singlePointEntry: false};
    //     }
    //   });
    // }

    $(this.formId).on('submit', e => {
      e.preventDefault();
      const slug = $('#slug').val();
      const updatedCourtAreasOfLaw = CasesHeardController.getSelectedCasesHeard($(e.target.getElementsByTagName('input')));
      console.log(updatedCourtAreasOfLaw);
      $.ajax({
        url: `/courts/${slug}/cases-heard`,
        method: 'put',
        data: {
          courtAreasOfLaw: updatedCourtAreasOfLaw,
          allAreasOfLaw: updatedCourtAreasOfLaw,
          csrfToken: $('#casesHeardTab input[name="_csrf"]').val()
        }
      }).done(res => {
        $(this.casesHeardContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT cases heard failed.'));
    });
  }

  private static getSelectedCasesHeard(elementList: JQuery): object[] {
    return $.map(elementList, function(value: HTMLElement){
      if ($(value).prop('checked')) {
        return { name: value.getAttribute('value'), id: value.id, singlePointEntry: false};
      }
    });
  }

}

