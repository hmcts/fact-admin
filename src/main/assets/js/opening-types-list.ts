import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class OpeningTypesController {

  private tabId = '#openingTypesListTab';
  private contentId = '#openingTypesListContent';
  private formId = '#openingTypesListForm';
  private deleteConfirmBtnId = '#confirmDelete';

  private editOpeningClass = 'edit-opening-type';
  private deleteOpeningClass = 'delete-opening-type';
  private cancelChangesClass = 'cancel-changes';


  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpEditEventHandler();
        this.setUpSubmitEventHandler();
        this.setUpCancelEventHandler();
        this.setUpDeleteConfirmEventHandler();
        this.setUpDeleteEventHandler();
      }
    });
  }

  private get(): void{
    $.ajax({
      url: '/lists/opening-types',
      method: 'get',
      success: async (res) => this.updateContent(res, this.contentId),
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET opening types failed.');
      }
    });
  }

  private setUpEditEventHandler(): void {
    $(this.tabId).on('click', `a.${this.editOpeningClass}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).attr('href'),
        method: 'get',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'GET opening types failed.')
      });
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
          AjaxErrorHandler.handleError(response, 'PUT opening failed.'));
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `a.${this.deleteOpeningClass}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).attr('href'),
        method: 'get',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'GET opening type delete confirmation failed.')
      });
    });
  }

  private setUpDeleteConfirmEventHandler(): void {
    $(this.tabId).on('click', `${this.deleteConfirmBtnId}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).data('url'),
        data: { _csrf: $(`${this.tabId} input[name="_csrf"]`).val() },
        method: 'delete',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'DELETE opening type failed.')
      });
    });
  }

  private setUpCancelEventHandler(): void {
    $(this.tabId).on('click', `.${this.cancelChangesClass}`, e => {
      this.get();
    });

    // Reset back to list view when tab changed
    $('.fact-tabs-list a').on('click',e => {
      if ($(this.cancelChangesClass)) {
        this.get();
      }
    });
  }



  private updateContent(content: any , contentId: string): void {
    $(contentId).html(content);
    initAll({scope: document.getElementById('openingTypesListTab')});
    window.scrollTo(0, 0);
  }
}
