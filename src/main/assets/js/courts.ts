import $ from 'jquery';
import {CourtsTableSearch} from './courts-table-search';

export class CourtsController {

  private contentId = '#main-content';
  private tableContainerId = '#tableContainer';
  private toggleClosedCourtsDisplay = 'toggleClosedCourtsDisplay';
  private searchCourtsFilter = 'searchCourts';
  private searchCourtsRegionFilter = 'regionSelector';
  private tableCourtsNameId = '#tableCourtsName';
  private tableCourtsUpdatedId = '#tableCourtsUpdated';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if($(this.tableContainerId).length) { // so that this doesn't load on each page
        CourtsTableSearch.setTableClasses($(this.tableCourtsNameId), CourtsTableSearch.getToggleStates()[0]);
        CourtsTableSearch.resetTableClasses($(this.tableCourtsUpdatedId));
        CourtsTableSearch.setUpTable();
        this.setUpToggleClosedCourtsDisplay();
        this.setUpCourtsDynamicSearchFilter();
        this.setUpCourtsRegionSearchFilter();
        this.setUpAscDecNameFilter();
        this.setUpAscDecUpdatedDateFilter();
        // To hide the region id column
        $('td:nth-child(2)').hide();
      }
    });
  }

  private setUpToggleClosedCourtsDisplay(): void {
    $(this.contentId).on('change', `input[name=${this.toggleClosedCourtsDisplay}]`, e => {
      e.preventDefault();
      CourtsTableSearch.setUpTable();
    });
  }

  private setUpCourtsDynamicSearchFilter(): void {
    $(this.contentId).on('input', `input[name=${this.searchCourtsFilter}]`, e => {
      e.preventDefault();
      CourtsTableSearch.setUpTable();
    });
  }

  private setUpCourtsRegionSearchFilter(): void {
    $(this.contentId).on('change', `select[name=${this.searchCourtsRegionFilter}]`, e => {
      e.preventDefault();
      CourtsTableSearch.setUpTable();
    });
  }

  private setUpAscDecNameFilter(): void {
    $(this.contentId).on('click', `${this.tableCourtsNameId}`, e => {
      e.preventDefault();
      CourtsTableSearch.setTableClasses($(this.tableCourtsNameId), CourtsTableSearch.getToggleStates()[0]);
      CourtsTableSearch.resetTableClasses($(this.tableCourtsUpdatedId));
      CourtsTableSearch.setUpTable();
    });
  }

  private setUpAscDecUpdatedDateFilter(): void {
    $(this.contentId).on('click', `${this.tableCourtsUpdatedId}`, e => {
      e.preventDefault();
      CourtsTableSearch.setTableClasses($(this.tableCourtsUpdatedId), CourtsTableSearch.getToggleStates()[1]);
      CourtsTableSearch.resetTableClasses($(this.tableCourtsNameId));
      CourtsTableSearch.setUpTable();
    });
  }
}
