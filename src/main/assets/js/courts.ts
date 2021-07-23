import $ from 'jquery';
import {orderToggleState} from '../../enums/searchToggleState';
import {CourtsTableSearch} from './courts-table-search';

export class CourtsController {

  private contentId = '#main-content';
  private tableContainerId = '#tableContainer';
  private toggleClosedCourtsDisplay = 'toggleClosedCourtsDisplay';
  private searchCourtsFilter = 'searchCourts';
  private courtsNameAscToggleId = '#courtsNameAscToggle';
  private courtsUpdatedAscToggleId = '#courtsUpdatedAscToggle';
  private tableCourtsNameId = '#tableCourtsName';
  private tableCourtsUpdatedId = '#tableCourtsUpdated';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if($(this.tableContainerId).length) { // so that this doesn't load on each page
        CourtsTableSearch.setUpTable('name', true);
        this.setUpToggleClosedCourtsDisplay();
        this.setUpCourtsDynamicSearchFilter();
        this.setUpAscDecNameFilter();
        this.setUpAscDecUpdatedDateFilter();
      }
    });
  }

  private setUpToggleClosedCourtsDisplay(): void {
    $(this.contentId).on('change', `input[name=${this.toggleClosedCourtsDisplay}]`, e => {
      e.preventDefault();
      $(this.courtsUpdatedAscToggleId).val() == orderToggleState.INACTIVE
        ? CourtsTableSearch.setUpTable('name')
        : CourtsTableSearch.setUpTable('date');
    });
  }

  private setUpCourtsDynamicSearchFilter(): void {
    $(this.contentId).on('input', `input[name=${this.searchCourtsFilter}]`, e => {
      e.preventDefault();
      const updatedToggleValue = $(this.courtsUpdatedAscToggleId).val() as string;
      // Depending on the active filter, sort the data using date or name filtering, whilst
      // also including the search input value
      (updatedToggleValue == orderToggleState.ASC || updatedToggleValue == orderToggleState.DESC)
        ? CourtsTableSearch.setUpTable('date')
        : CourtsTableSearch.setUpTable('name');
    });
  }

  private setUpAscDecNameFilter(): void {
    $(this.contentId).on('click', `${this.tableCourtsNameId}`, e => {
      e.preventDefault();
      const ascToggle = $(this.courtsNameAscToggleId);
      CourtsTableSearch.switchTableToggle(ascToggle, $(this.courtsUpdatedAscToggleId));
      CourtsTableSearch.setUpTable('name');
    });
  }

  private setUpAscDecUpdatedDateFilter(): void {
    $(this.contentId).on('click', `${this.tableCourtsUpdatedId}`, e => {
      e.preventDefault();
      CourtsTableSearch.switchTableToggle($(this.courtsUpdatedAscToggleId), $(this.courtsNameAscToggleId));
      CourtsTableSearch.setUpTable('date');
    });
  }
}
