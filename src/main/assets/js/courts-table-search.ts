import $ from 'jquery';
import {orderToggleState} from '../../enums/searchToggleState';
import {CourtItem} from '../../types/CourtItem';

export class CourtsTableSearch {

  private static toggleClosedCourtsDisplay = 'toggleClosedCourtsDisplay';
  private static numberOfCourts = '#numberOfCourts';
  private static searchCourtsFilterId = '#searchCourts';
  private static searchCourtsByRegionId = '#regionSelector';
  private static tableData = '#courtResults';
  private static courtsResultsSection = '#courtResults > tbody';
  private static courtsTableHeaderAsc = 'courts-table-header-asc';
  private static courtsTableHeaderDesc = 'courts-table-header-desc';
  private static courtsTableHeaderInactive = 'courts-table-header-inactive';
  private static tableCourtsNameId = '#tableCourtsName';
  private static tableCourtsUpdatedId = '#tableCourtsUpdated';

  /**
   *
   * Sets up the table view for the main page. This is updated on each search toggle or courts search
   *
   */
  public static setUpTable(): void {
    const toggleValues = CourtsTableSearch.getToggleStates();
    CourtsTableSearch.setUpTableData(
      $(this.searchCourtsFilterId).val() as string,
      $(this.searchCourtsByRegionId).val() as string,
      $(`#main-content input[name=${this.toggleClosedCourtsDisplay}]`).prop('checked'),
      toggleValues[0], toggleValues[1]);
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
  private static setUpTableData(searchFilterValue: string, regionFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): void {
    const filteredCourts = CourtsTableSearch.filterCourts(this.getExistingTableData(),
      searchFilterValue, regionFilterValue, includeClosedCourts,
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

        switch ($(dataCell).data('type')) {
          case 'name':
            courtItem.name = $(dataCell).text();
            courtItem.slug = $(dataCell).data('name');
            break;
          case 'region':
            courtItem.region = $(dataCell).text();
            break;
          case 'displayed':
            courtItem.displayed = $(dataCell).data('displayed');
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
  private static filterCourts(courts: CourtItem[], searchFilterValue: string, regionFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): CourtItem[] {

    courts.forEach((courtItem) => {
      if (regionFilterValue != '' && searchFilterValue.trim().length > 0) {
        courtItem.visible = ((includeClosedCourts || courtItem.displayed)
          && courtItem.name.toLowerCase().includes(searchFilterValue.toString().toLowerCase())
          && courtItem.region == regionFilterValue);
      } else if (regionFilterValue != '') {
        courtItem.visible = ((includeClosedCourts || courtItem.displayed)
          && courtItem.region == regionFilterValue);
      } else if (searchFilterValue.trim().length > 0) {
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
        ? '<tr class="govuk-table__row courtTableRowHidden" hidden>' : '<tr class="govuk-table__row>">') +
        value.row.html() +
        '</tr>';
    });
    return tableData;
  }

  /**
   *
   * Based on the toggle state, alter the visual symbol that appears to the side of the column
   * heading
   *
   * @param thToToggle the jquery element parameter to toggle the visual symbol of
   * @param toggleState the state that determines what it will will look like next
   */
  public static setTableClasses(thToToggle: JQuery, toggleState: orderToggleState): void {

    switch (toggleState) {
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
  }

  /**
   *
   * Reset the provided table header to that of the class
   * that shows that no search is active
   *
   * @param thToReset the element to reset
   */
  public static resetTableClasses(thToReset: JQuery): void {
    thToReset.removeClass(this.courtsTableHeaderAsc)
      .removeClass(this.courtsTableHeaderDesc)
      .addClass(this.courtsTableHeaderInactive);
  }

  /**
   * Based on the two elements that display what sorting option is active,
   * return what state they are both in
   * @returns an array of states; index 0 for the name search state, index 1 for the date search state
   */
  public static getToggleStates(): orderToggleState[] {
    const nameToggleValueClasses = $(this.tableCourtsNameId).attr('class');
    const updatedToggleValueClasses = $(this.tableCourtsUpdatedId).attr('class');

    if (nameToggleValueClasses.includes(this.courtsTableHeaderInactive)) {
      if (updatedToggleValueClasses.includes(this.courtsTableHeaderAsc))
        return [orderToggleState.INACTIVE, orderToggleState.ASC];
      else if (updatedToggleValueClasses.includes(this.courtsTableHeaderDesc))
        return [orderToggleState.INACTIVE, orderToggleState.DESC];
      else return [orderToggleState.INACTIVE, orderToggleState.INACTIVE];
    }
    else if (updatedToggleValueClasses.includes(this.courtsTableHeaderInactive)) {
      if (nameToggleValueClasses.includes(this.courtsTableHeaderAsc))
        return [orderToggleState.ASC, orderToggleState.INACTIVE];
      else if (nameToggleValueClasses.includes(this.courtsTableHeaderDesc))
        return [orderToggleState.DESC, orderToggleState.INACTIVE];
      else return [orderToggleState.INACTIVE, orderToggleState.INACTIVE];
    }
  }
}
