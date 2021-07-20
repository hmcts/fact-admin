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

  /**
   *
   * Sets up the table view for the main page, on load the default configuration
   * is used, otherwise it is updated on each search toggle or courts search
   *
   * @param filterName Either 'name' or 'date' depending on the type of toggle
   * @param defaultValue set to false by default on initial load
   */
  static setUpTable(filterName: string, defaultValue = false): void {
    defaultValue
      ? CourtsTableSearch.setUpTableData(
        (document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
      $(this.searchCourtsFilterId).val() as string, // if the user clicks 'back' in the browser after view or editing
      false, orderToggleState.ASC, orderToggleState.INACTIVE)
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

  /**
   *
   * Retrieves the filtered results from the toggles and search, and sets the html
   * of the tbody element of the table accordingly
   *
   * @param courts the list of public court information
   * @param searchFilterValue the search value from the 'search courts or tribunals' input field
   * @param includeClosedCourts whether or not to include closed courts in the result
   * @param orderNameAscendingFilter whether to sort by name asc or desc
   * @param orderUpdatedAscendingFilter whether to sort by last updated date asc or desc
   * @private
   */
  private static setUpTableData(courts: string, searchFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): void {
    const filteredCourts = CourtsTableSearch.filterCourts(courts, searchFilterValue, includeClosedCourts,
      orderNameAscendingFilter, orderUpdatedAscendingFilter);
    $(this.courtsResultsSection).html(CourtsTableSearch.getCourtsTableBody(filteredCourts));
    searchFilterValue.length ? $(this.numberOfCourts).show().text(
      'Showing ' + filteredCourts.length + ' results')
      : $(this.numberOfCourts).hide();
  }

  /**
   *
   * Takes a list of courts, and filters based on a set list of criteria:
   * 1. Name Asc/Desc
   * 2. Updated date Asc/Desc
   * 3. Resets whichever one is not enabled
   * 4. Based on the above, also filters the result list based on the search string from the 'search' input field
   *
   * @param courts the list of public courts
   * @param searchFilterValue the string value of the search input field
   * @param includeClosedCourts whether or not to include closed courts in the result
   * @param orderNameAscendingFilter whether to sort by name asc or desc
   * @param orderUpdatedAscendingFilter whether to sort by last updated date asc or desc
   * @private
   */
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

  /**
   *
   * Create and return the tbody of the table based on a list of table row elements that are created
   * by looping through each filtered court
   *
   * @param filteredCourts the filtered list of public courts
   * @private
   */
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

  /**
   *
   * Switch what toggle is active; i.e if name is clicked on, updated date will
   * be reset to default and vise versa
   *
   * @param toToggle the jquery element parameter to toggle
   * @param toReset the jquery element parameter to reset
   */
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
      default:
        break;
    }

    toReset.val(orderToggleState.INACTIVE);
  }

  /**
   *
   * Based on the toggle state, alter the visual symbol that appears to the side of the column
   * heading
   *
   * @param tableState the state of the clicked on filter (name or updated date)
   * @param thToToggle the jquery element parameter to toggle the visual symbol of
   * @param thToReset the jquery element parameter to reset the visual symbol of
   * @private
   */
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
      default:
        break;
    }

    thToReset.removeClass(this.courtsTableHeaderAsc)
      .removeClass(this.courtsTableHeaderDesc)
      .addClass(this.courtsTableHeaderInactive);
  }
}
