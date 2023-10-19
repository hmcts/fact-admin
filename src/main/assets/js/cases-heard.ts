import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {CasesHeard} from '../../types/CasesHeard';
import {setUpTabClick} from './tab-reset';

const { initAll } = require('govuk-frontend');

export class CasesHeardController {
  private formId = '#casesHeardForm';
  private tabId = '#casesHeardTab';
  private casesHeardContentId = '#casesHeardContent';
  private localAuthoritiesContentId = '#localAuthoritiesContent';
  private tab = '#tab_cases-heard';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getCasesHeard.bind(this));
        this.getCasesHeard();
        this.setUpUpdateEventHandler();
      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({ scope: document.getElementById('casesHeardTab') });
    initAll({scope: document.getElementById('localAuthoritiesTab')});
  }

  private getCasesHeard(): void {
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/cases-heard`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.casesHeardContentId);
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET cases heard failed.');
      }
    });
  }

  private setUpUpdateEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const slug = $('#slug').val();
      const updatedCourtAreasOfLaw = CasesHeardController.getSelectedCasesHeard($(e.target.getElementsByTagName('input')));
      const allAreasOfLaw = CasesHeardController.getAllAreasOfLaw($('[data-inputType="cases-heard"]'));
      $.ajax({
        url: `/courts/${slug}/cases-heard`,
        method: 'put',
        data: {
          courtAreasOfLaw: updatedCourtAreasOfLaw,
          allAreasOfLaw: allAreasOfLaw,
          csrfToken: $(this.tabId + ' input[name="_csrf"]').val()
        }
      }).done(async (res) => {
        await this.updateContent(res, this.casesHeardContentId);
        this.getAreasOfLaw();
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT cases heard failed.'));
    });
  }

  private static getSelectedCasesHeard(elementList: JQuery): CasesHeard[] {
    return $.map(elementList, function(value: HTMLElement){
      if ($(value).prop('checked')) {
        return { name: value.getAttribute('value'), id: value.dataset.id, singlePointEntry: false} as CasesHeard;
      }
    });
  }

  private static getAllAreasOfLaw(elementList: JQuery): CasesHeard[] {
    return $.map(elementList, function(value: HTMLElement){
      return { name: value.getAttribute('value'), id: value.dataset.id, singlePointEntry: false} as CasesHeard;
    });
  }

  //below method makes sure local authorities' error message is removed and added when family court areas of law are updated.
  private getAreasOfLaw(): void{
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/local-authorities-areas-of-law`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.localAuthoritiesContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET local authorities areas of law failed.')
    });
  }
}

