import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

const { initAll } = require('govuk-frontend');

export class FacilityTypesController {

  private tabId = '#facilityTypesListTab';
  private contentId = '#facilityTypesListContent';
  private formId = '#facilityTypesListForm';
  private deleteConfirmBtnId = '#confirmDelete';
  private saveReorderBtnId = '#saveFacilityTypeReorder';

  private editFacilityClass = 'edit-facility-type';
  private deleteFacilityClass = 'delete-facility-type';
  private reorderFacilityClass = 'order-facility-type';
  private cancelChangesClass = 'cancel-changes';
  private moveUpBtnClass = 'facility-move-up';
  private moveDownBtnClass = 'facility-move-down';

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
        this.setUpReordering();
      }
    });
  }

  private get(): void{
    $.ajax({
      url: '/lists/facility-types',
      method: 'get',
      success: async (res) => this.updateContent(res, this.contentId),
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET facility types failed.');
      }
    });
  }

  private setUpEditEventHandler(): void {
    $(this.tabId).on('click', `a.${this.editFacilityClass}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).attr('href'),
        method: 'get',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'GET facility types failed.')
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
          AjaxErrorHandler.handleError(response, 'PUT facility failed.'));
    });
  }

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `a.${this.deleteFacilityClass}`, e => {
      e.preventDefault();

      $.ajax({
        url: $(e.target).attr('href'),
        method: 'get',
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'GET facility type delete confirmation failed.')
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
          AjaxErrorHandler.handleError(jqxhr, 'DELETE facility type failed.')
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

  private setUpReordering(): void {
    // Move table row up on 'up' button click
    $(this.tabId).on('click', 'button.' + this.moveUpBtnClass, e => {
      const rowToMove = e.target.closest('tr');
      const rowAbove = $(rowToMove).prev('tr');

      if (rowAbove.length === 1) {
        $(rowToMove).insertBefore(rowAbove);
      }
    });

    // Move table row down on 'down' button click
    $(this.tabId).on('click', 'button.' + this.moveDownBtnClass, e => {
      const rowToMove = e.target.closest('tr');
      const rowBelow = $(rowToMove).next('tr');

      if (rowBelow.length === 1) {
        $(rowToMove).insertAfter(rowBelow);
      }
    });

    // Post new facility type id order to API upon save button press
    $(this.tabId).on('click', this.saveReorderBtnId, e => {
      e.preventDefault();

      $.ajax({
        url: '/lists/facility-types/reorder',
        method: 'put',
        data: $(this.formId).serialize(),
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'PUT facility type reorder failed.')
      });
    });

    // Show re-order view when global reorder link clicked
    $(this.tabId).on('click', 'a.' + this.reorderFacilityClass, e => {
      e.preventDefault();

      $.ajax({
        url: '/lists/facility-types/reorder',
        method: 'get',
        data: $(this.formId).serialize(),
        success: async (res) => await this.updateContent(res, this.contentId),
        error: (jqxhr, errorTextStatus, err) =>
          AjaxErrorHandler.handleError(jqxhr, 'PUT facility type reorder failed.')
      });
    });
  }

  private updateContent(content: any , contentId: string): void {
    $(contentId).text(content);
    initAll({scope: document.getElementById('facilityTypesListTab')});
    window.scrollTo(0, 0);
  }
}
