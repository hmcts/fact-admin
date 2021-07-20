import $ from 'jquery';
import {orderToggleState} from '../../enums/searchToggleState';

export class CourtsTableSearch {

  private static toggleClosedCourtsDisplay = 'toggleClosedCourtsDisplay';
  private static numberOfCourts = '#numberOfCourts';
  private static searchCourtsFilterId = '#searchCourts';
  private static courtsHiddenId = 'courtsHidden';
  private static courtsNameAscToggleId = '#courtsNameAscToggle';
  private static courtsUpdatedAscToggleId = '#courtsUpdatedAscToggle';
  private static courtsResultsSection = '#courtResults > tbody';
  private static courtsTableHeaderAsc = 'courts-table-header-asc';
  private static courtsTableHeaderDesc = 'courts-table-header-desc';
  private static courtsTableHeaderInactive = 'courts-table-header-inactive';
  private static courtsFrontendUrl = '#courtsFrontendUrl';
  private static tableCourtsNameId = '#tableCourtsName';
  private static tableCourtsUpdatedId = '#tableCourtsUpdated';

  static setUpTable(filterName: string, defaultValue = false): void {

    defaultValue
      ? CourtsTableSearch.setUpTableData(
        (document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        '', false, orderToggleState.ASC, orderToggleState.INACTIVE)
      : CourtsTableSearch.setUpTableData((
        document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        $(this.searchCourtsFilterId).val() as string,
        $(`#main-content input[name=${this.toggleClosedCourtsDisplay}]`).prop('checked'),
        $(this.courtsNameAscToggleId).val() as string,
        $(this.courtsUpdatedAscToggleId).val() as string);

    filterName == 'name' ?
      CourtsTableSearch.switchTableClasses($(this.courtsNameAscToggleId),
        $(this.tableCourtsNameId), $(this.tableCourtsUpdatedId)) :
      CourtsTableSearch.switchTableClasses($(this.courtsUpdatedAscToggleId),
        $(this.tableCourtsUpdatedId), $(this.tableCourtsNameId));
  }

  private static setUpTableData(courts: string, searchFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): void {
    const filteredCourts = CourtsTableSearch.filterCourts(courts, searchFilterValue, includeClosedCourts,
      orderNameAscendingFilter, orderUpdatedAscendingFilter);
    $(this.courtsResultsSection).html(CourtsTableSearch.getCourtsTableBody(filteredCourts));
    searchFilterValue.length ? $(this.numberOfCourts).show().text(
      'Showing ' + filteredCourts.length + ' results')
      : $(this.numberOfCourts).hide();
  }

  private static filterCourts(courts: string, searchFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): any {

    return JSON.parse(courts)
      .filter((court: { displayed: boolean }) => {
        if (includeClosedCourts) {
          return court.displayed == true || court.displayed == false;
        }
        else return court.displayed == true;
      }).filter((court: { name: string }) => {
        if (searchFilterValue.length == 0)
          return court;
        else if (court.name.toLowerCase().includes(searchFilterValue.toString().toLowerCase())) {
          return court;
        }
      }).sort(((a: { name: string; updated_at: string }, b: { name: string; updated_at: string }) => {

        switch (orderNameAscendingFilter) {
          case orderToggleState.ASC:
            return (a.name > b.name) ? 1 : -1;
          case orderToggleState.DESC:
            return (a.name < b.name) ? 1 : -1;
          default:
            break;
        }

        switch (orderUpdatedAscendingFilter) {
          case orderToggleState.ASC:
            return (Date.parse(a.updated_at) > Date.parse(b.updated_at)) ? 1 : -1;
          case orderToggleState.DESC:
            return (Date.parse(a.updated_at) < Date.parse(b.updated_at)) ? 1 : -1;
          default:
            break;
        }
      }));
  }

  private static getCourtsTableBody(filteredCourts: any): string {
    let tableData = '';
    $.each(filteredCourts,function(index,value) {
      function getDataStructure(name: string, updatedAt: string, displayed: string, slug: string, frontendUrl: string): string {
        return ' <tr class="govuk-table__row">' +
          ' <td id = "courtTableColumnName" class="govuk-table__cell">' + name + ' </td>' +
          ' <td id = "courtTableColumnClosed" class="govuk-table__cell">' + (displayed ? '' : 'closed') + ' </td>' +
          ' <td id = "courtTableColumnLastUpdated" class="govuk-table__cell">' + updatedAt + ' </td>' +
          ' <td class="govuk-table__cell">' +
          '   <a id="view-"' + slug + ' class="govuk-link" href="' + frontendUrl +  '/courts/' + slug + '">view</a>' +
          ' </td>' +
          ' <td class="govuk-table__cell">' +
          '   <a id="edit-"' + slug + ' class="govuk-link" href="/courts/' + slug + '/edit#general">edit</a>' +
          ' </td>' +
          ' </tr>';
      }

      tableData += getDataStructure(value.name, value.updated_at ?? '',
        value.displayed, value.slug, $(CourtsTableSearch.courtsFrontendUrl).val() as string);
    });

    return tableData;
  }

  static switchTableToggle(toToggle: JQuery, toReset: JQuery): void {
    const toggleUpdatedVal = toToggle.val();

    switch (toggleUpdatedVal) {
      case orderToggleState.ASC: {
        toToggle.val(orderToggleState.DESC);
        break;
      }
      case orderToggleState.DESC: {
        toToggle.val(orderToggleState.ASC);
        break;
      }
      case orderToggleState.INACTIVE: {
        toToggle.val(orderToggleState.ASC);
        break;
      }
    }

    toReset.val(orderToggleState.INACTIVE);
  }

  private static switchTableClasses(tableState: JQuery, thToToggle: JQuery, thToReset: JQuery): void {

    switch (tableState.val()) {
      case orderToggleState.ASC: {
        thToToggle.removeClass(this.courtsTableHeaderInactive)
          .removeClass(this.courtsTableHeaderAsc)
          .addClass(this.courtsTableHeaderDesc);
        break;
      }
      case orderToggleState.DESC: {
        thToToggle.removeClass(this.courtsTableHeaderInactive)
          .removeClass(this.courtsTableHeaderDesc)
          .addClass(this.courtsTableHeaderAsc);
        break;
      }
      case orderToggleState.INACTIVE: {
        thToToggle.removeClass(this.courtsTableHeaderInactive)
          .addClass(this.courtsTableHeaderAsc);
        break;
      }
    }

    thToReset.removeClass(this.courtsTableHeaderAsc)
      .removeClass(this.courtsTableHeaderDesc)
      .addClass(this.courtsTableHeaderInactive);
  }
}
