import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {Utilities} from './utilities';

const { initAll } = require('govuk-frontend');

export class CourtTypesController {
  private formId = '#courtTypesForm';
  private tabId = '#courtTypesTab';
  private courtTypesContentId = '#courtTypesContent';
  private localAuthoritiesContentId = '#localAuthoritiesContent';
  private localAuthoritiesTabId ='#tab_local-authorities';
  private postcodesNavTab = '#tab_postcodes'

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getCourtTypes();
        this.setUpSubmitEventHandler();
      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({ scope: document.getElementById('courtTypesTab') });
    initAll({scope: document.getElementById('localAuthoritiesTab')});
  }

  private getCourtTypes(): void {
    const slug = $('#slug').val();

    $.ajax({
      url: `/courts/${slug}/court-types`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res,this.courtTypesContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET court types failed.')
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
      }).done( async res => {
        await this.updateContent(res, this.courtTypesContentId);
        window.scrollTo(0, 0);
        this.getAreasOfLaw();
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST court types failed.'));
    });
  }

  //added below methods to make sure local authorities tabs is enabled and disabled when family court type is updated.
  private getAreasOfLaw(): void{
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/local-authorities-areas-of-law`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.localAuthoritiesContentId);
        Utilities.toggleTabEnabled(this.localAuthoritiesTabId, Boolean($('#enabled').val() === 'true'));
        this.togglePostcodesTab();
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET local authorities areas of law failed.')
    });
  }

  // In the event that the court type is updated to county court, enable the postcodes tab if it has been disabled
  private togglePostcodesTab(): void{

    Utilities.toggleTabEnabled(this.postcodesNavTab,
      Utilities.isCheckboxItemSelected('[name="types"]', 'County Court'));

    // $('[name="types"]').each(function(){
    //   if ($(this).prop('checked')) {
    //     if ($(this).val().toString().indexOf('County Court') >= 0) {
    //       console.log('checked');
    //     }
    //   }
    // });
  }
}
