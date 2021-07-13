import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class LocalAuthoritiesListController {
  private formId = '#localAuthoritiesListForm';
  private tabId = '#localAuthoritiesListTab';
  private localAuthoritiesContentId = '#localAuthoritiesListContent';
  private radio = '.govuk-radios__input';
  private label = '#selected';
  private input = '.govuk-input';
  private edit = '#edit';


  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpSubmitEventHandler();
        this.setUpRadioEventHandler();
      }
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {

    $(contentId).html(content);
    initAll({scope: document.getElementById('localAuthoritiesListTab')});

  }


  private get(): void{
    $.ajax({
      url: '/lists/local-authorities-list',
      method: 'get',
      success: async (res) => {
        await this.updateContent(res, this.localAuthoritiesContentId);
      },
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET local authorities failed.')
    });

  }

  private setUpSubmitEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const url = '/lists/local-authorities-list';
      $.ajax({
        url: url,
        method: 'put',
        data: $(e.target).serialize()
      }).done( async res => {
        await this.updateContent(res, this.localAuthoritiesContentId);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'POST local authority failed.'));
    });
  }

  private setUpRadioEventHandler(): void {

    $(this.tabId).on('click', `${this.radio}`, e => {
      const selected = JSON.parse($(e.target).val().toString());

      $(this.label).empty();
      $(this.label).append('Edit ' + selected.name);

      $(this.input).empty();
      $(this.input).val(selected.name);

      $(this.edit).removeClass('no-display');

    });
  }



}
