import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class ContactTypesListController {

  private tabId = '#contactTypeListTab';
  private contentId = '#contactTypeListContent';
  private formId = '#contactTypeListForm';
  private cancelBtnId = '#cancelContactTypeChangesBtn';
  private deleteConfirmBtnId = '#confirmDelete';
  private editCtClass = 'edit-ct';
  private deleteCtClass = 'delete-ct';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.get();
        this.setUpEditEventHandler();
        this.setUpDeleteEventHandler();
        this.setUpDeleteConfirmEventHandler();
        this.setUpCancelEventHandler();
        this.setUpSubmitEventHandler();
      }
    });
  }

  private get(): void{
    $.ajax({
      url: '/lists/contact-types',
      method: 'get',
      success: async (res) => await this.updateContent(res, this.contentId),
      error: (jqxhr, errorTextStatus, err) =>
        AjaxErrorHandler.handleError(jqxhr, 'GET contact types failed.')
    });
  }

  private setUpEditEventHandler(): void {
    $(this.tabId).on('click', `a.${this.editCtClass}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).attr('href'),
        method: 'get',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'GET contact type failed.')
      });
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `a.${this.deleteCtClass}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).attr('href'),
        method: 'get',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'GET contact type delete confirmation failed.')
      });
    });
  }

  private setUpDeleteConfirmEventHandler(): void {
    $(this.tabId).on('click', `${this.deleteConfirmBtnId}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).data('url'),
        method: 'delete',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'DELETE contact type failed.')
      });
    });
  }

  private setUpCancelEventHandler(): void {
    $(this.tabId).on('click', this.cancelBtnId, e => {
      this.get();
    });

    // Reset back to list view when tab changed
    $('.fact-tabs-list a').on('click',e => {
      if ($(this.cancelBtnId)) {
        this.get();
      }
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
          AjaxErrorHandler.handleError(response, 'PUT contact type failed.'));
    });
  }

  private async updateContent(content: any , contentId: string): Promise<void> {
    $(contentId).html(content);
    initAll({scope: document.getElementById('contactTypeListTab')});
    window.scrollTo(0, 0);
  }
}
