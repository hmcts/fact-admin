import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';


const { initAll } = require('govuk-frontend');

export class LocalAuthoritiesController {
  private formId = '#localAuthoritiesForm';
  private tabId = '#localAuthoritiesTab';
  private localAuthoritiesContentId = '#localAuthoritiesContent';
  private localAuthoritiesTabId ='#tab_local-authorities';
  private localAuthoritiesListId = '#localAuthoritiesList';

  private slug = $('#slug').val();
  private areaOfLaw = ($('#courtAreasOfLaw').val() == undefined ) ? 'unknown': $('#courtAreasOfLaw').val();

  private getLocalAuthoritiesSelect = '#courtAreasOfLaw';


  constructor() {
    this.initialize();

  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.displayLocalAuthoritiesTab();
        this.getAreasOfLaw();
        this.setUpGetLocalAuthoritiesEventHandler();
        this.setUpSubmitEventHandler();
      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {

    $(contentId).html(content);
    initAll({scope: document.getElementById('localAuthoritiesTab')});

  }

  private getAreasOfLaw(): void{
    $.ajax({
      url: `/courts/${this.slug}/local-authorities-areas-of-law`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.localAuthoritiesContentId);
        this.disableLocalAuthoritiesTab();
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET local authorities areas of law failed.')
    });

  }

  private getLocalAuthorities(): void{
    $.ajax({
      url: `/courts/${this.slug}/${this.areaOfLaw}/local-authorities`,
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.localAuthoritiesContentId);
        this.scrollable();

      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET local authorities failed.')
    });

  }

  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      this.areaOfLaw = $('#courtAreasOfLaw').val();
      const url = `/courts/${this.slug}/${this.areaOfLaw}/local-authorities`;
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done( async res => {
        await this.updateContent(res, this.localAuthoritiesContentId);
        window.scrollTo(0, 0);
        this.scrollable();
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST local authorities failed.'));
    });
  }

  private displayLocalAuthoritiesTab(): void{

    const isSuperAdmin = Boolean($('#isSuperAdmin').val() === 'true');
    if(!isSuperAdmin){
      $('ul li').eq(5).remove();
    }
  }

  private disableLocalAuthoritiesTab(): void{
    const isEnabled = Boolean($('#enabled').val() === 'true');
    if(!isEnabled) {
      $(this.localAuthoritiesTabId).addClass('disable-tab');
      $(this.localAuthoritiesTabId).attr('disabled') ;
    }
    else
    {
      $(this.localAuthoritiesTabId).removeClass('disable-tab');
      $(this.localAuthoritiesTabId).removeAttr('disabled') ;
    }
  }

  private scrollable(): void{
    $(this.localAuthoritiesListId).addClass('visible-scrollbar');
    $(this.localAuthoritiesListId).addClass('scrollable');
    $(this.localAuthoritiesListId).attr('role','scrollbar') ;

  }


  private setUpGetLocalAuthoritiesEventHandler(): void {
    $(this.tabId).on('change', `${this.getLocalAuthoritiesSelect}`, e => {
      e.preventDefault();
      this.areaOfLaw = $('#courtAreasOfLaw').val();
      this.getLocalAuthorities();
    });


  }








}
