import $ from 'jquery';
import {orderToggleState} from '../../enums/searchToggleState';
import {CourtItem} from '../../types/CourtItem';

export class CourtsTableSearch {

  private static toggleClosedCourtsDisplay = 'toggleClosedCourtsDisplay';
  private static numberOfCourts = '#numberOfCourts';
  private static searchCourtsFilterId = '#searchCourts';
  private static tableData = '#courtResults';
  private static courtsNameAscToggleId = '#courtsNameAscToggle';
  private static courtsUpdatedAscToggleId = '#courtsUpdatedAscToggle';
  private static courtsResultsSection = '#courtResults > tbody';
  private static courtsTableHeaderAsc = 'courts-table-header-asc';
  private static courtsTableHeaderDesc = 'courts-table-header-desc';
  private static courtsTableHeaderInactive = 'courts-table-header-inactive';
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
  static setUpTable(filterName: 'name' | 'date', defaultValue = false): void {
    defaultValue
      ? CourtsTableSearch.setUpTableData(
        $(this.searchCourtsFilterId).val() as string, // if the user clicks 'back' in the browser after view or editing
        false, orderToggleState.ASC, orderToggleState.INACTIVE)
      : CourtsTableSearch.setUpTableData(
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
   * @param searchFilterValue the search value from the 'search courts or tribunals' input field
   * @param includeClosedCourts whether or not to include closed courts in the result
   * @param orderNameAscendingFilter whether to sort by name asc or desc
   * @param orderUpdatedAscendingFilter whether to sort by last updated date asc or desc
   * @private
   */
  private static setUpTableData(searchFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): void {
    const filteredCourts = CourtsTableSearch.filterCourts(this.getExistingTableData(),
      searchFilterValue, includeClosedCourts,
      orderNameAscendingFilter, orderUpdatedAscendingFilter);
    $(this.courtsResultsSection).html(CourtsTableSearch.getCourtsTableBody(filteredCourts));
    $(this.numberOfCourts).show().text('Showing '
        + filteredCourts.filter(d => d.visible).length + ' results');
  }

  /**
   *
   * Get the court data by extracting it from the table
   *
   * @private
   */
  private static getExistingTableData(): CourtItem[] {
    const courtItems = [] as CourtItem[];
    $(this.tableData).find('tr').each(function(i, row) {
      if (i == 0)
        // the first index is for the column names; i.e name, displayed, updated_at
        return;

      const courtItem = {} as CourtItem;
      $(row).find('td').each(function(i, dataCell) {

        switch ($(dataCell).attr('type')) {
          case 'name':
            courtItem.name = $(dataCell).text();
            courtItem.slug = $(dataCell).attr('name');
            break;
          case 'displayed':
            courtItem.displayed = $(dataCell).attr('value') === 'true';
            break;
          case 'updated_at': {
            const updatedAt = new Date($(dataCell).text());
            // check if it is not a number, as otherwise the sorting will fail
            isNaN(updatedAt.getTime()) ? courtItem.updatedAt = new Date(0) :
              courtItem.updatedAt = updatedAt;
            break;
          }
          default:
            break;
        }
      });

      courtItem.row = $(row);
      courtItems.push(courtItem);
    });
    return courtItems;
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
  private static filterCourts(courts: CourtItem[], searchFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): CourtItem[] {

    courts.forEach((courtItem) => {
      if (searchFilterValue.trim().length > 0) {
        courtItem.visible = ((includeClosedCourts || courtItem.displayed)
          && courtItem.name.toLowerCase().includes(searchFilterValue.toString().toLowerCase()));
      } else
        courtItem.visible = (includeClosedCourts || courtItem.displayed);
    });

    return courts.sort(((courtItemA, courtItemB) => {
      switch (orderNameAscendingFilter) {
        case orderToggleState.ASC:
          return (courtItemA.name > courtItemB.name) ? 1 : -1;
        case orderToggleState.DESC:
          return (courtItemA.name < courtItemB.name) ? 1 : -1;
        default:
          break;
      }
      switch (orderUpdatedAscendingFilter) {
        case orderToggleState.ASC:
          return ((courtItemA.updatedAt.getTime() < courtItemB.updatedAt.getTime()) ? 1 : -1);
        case orderToggleState.DESC:
          return ((courtItemA.updatedAt.getTime() > courtItemB.updatedAt.getTime()) ? 1 : -1);
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
  private static getCourtsTableBody(filteredCourts: CourtItem[]): string {
    let tableData = '';
    $.each(filteredCourts,function(index,value): void {
      tableData += (!value.visible
        ? '<tr class="govuk-table__row" hidden>' : '<tr class="govuk-table__row>">') +
        value.row.html() +
        '</tr>';
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
