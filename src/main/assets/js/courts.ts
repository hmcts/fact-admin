import $ from 'jquery';

export class CourtsController {

  private contentId = '#main-content';
  private toggleCourts = 'toggleClosedCourtsDisplay';
  // private toggleCourtsId = '#toggleClosedCourtsDisplay';
  private searchCourtsFilter = 'searchCourts';
  private searchCourtsFilterId = '#searchCourts';
  private courtsHiddenId = 'courtsHidden';
  // private courtsHiddenFilteredId = 'courtsHiddenFiltered';
  private courtsResults = 'courtsResults';
  private TABLE_HEADER = '    <table class="govuk-table" id="courtsResults">' +
    '      <thead class="govuk-table__head">' +
    '        <tr class="govuk-table__row">' +
    '          <th scope="col" class="govuk-table__header govuk-!-width-one-half">Name</th>' +
    '          <th scope="col" class="govuk-table__header"></th>' +
    '          <th scope="col" class="govuk-table__header">Last Updated</th>' +
    '          <th scope="col" class="govuk-table__header"></th>' +
    '          <th scope="col" class="govuk-table__header"></th>' +
    '        </tr>' +
    '      </thead>';
  private TABLE_BODY_START = ' <tbody class="govuk-table__body">';
  private TABLE_HEADER_BODY_END = '</tbody> </table>';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      this.setUpTableData((document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        '', false);
      this.setUpToggleClosedCourtsDisplay();
      this.setUpCourtsDynamicSearchFilter();
    });
  }

  private setUpToggleClosedCourtsDisplay(): void {
    $(this.contentId).on('change', `input[name=${this.toggleCourts}]`, e => {
      e.preventDefault();
      this.setUpTableData((document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        $(this.searchCourtsFilterId).val() as string,
        $('#main-content input[name="toggleClosedCourtsDisplay"]').prop('checked'));
    });
  }

  private setUpCourtsDynamicSearchFilter(): void {
    $(this.contentId).on('input', `input[name=${this.searchCourtsFilter}]`, e => {
      e.preventDefault();
      this.setUpTableData((document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        $(this.searchCourtsFilterId).val() as string,
        $('#main-content input[name="toggleClosedCourtsDisplay"]').prop('checked'));
    });
  }

  private setUpTableData(courts: string, searchFilterValue: string, includeClosedCourts: boolean) {

    let tableBody = this.TABLE_HEADER + this.TABLE_BODY_START;

    // const tableCourtData = this.getFilteredSearchResults(courts, searchFilterValue, includeClosedCourts) as unknown as string;

    // sorting .sort((a: { name: string }, b: { name: string }) => (a.name > b.name) ? 1 : -1)

    const filteredCourts = JSON.parse(courts).filter((a: { displayed: boolean }) => {
      if (includeClosedCourts) {
        return a.displayed == true || a.displayed == false;
      }
      else return a.displayed == true;
    }).filter((a: { name: string }) => {
      if (searchFilterValue.length == 0)
        return a;
      else if (a.name.toLowerCase().includes(searchFilterValue.toString().toLowerCase())) {
        return a;
      }
    });

    tableBody += this.getCourtsTableBody(filteredCourts) + this.TABLE_HEADER_BODY_END;

    (document.getElementById(this.courtsResults) as HTMLElement).outerHTML = tableBody;
  }

  // private getFilteredSearchResults(courts: string, filterValue: string,
  //   includeClosedCourts: boolean): (string | number | symbol)[] {
  //   const filteredCourtsList: (string | number | symbol)[] = [];
  //
  //   $.each(JSON.parse(courts),function(index, value){
  //
  //     // Conditions:
  //     // 1. Check if the toggle box for 'include closed' is selected or not
  //     // 2. Get the filter value, and search based on that if it is populated
  //     // if(value.name.toLowerCase().includes(filterValue.toString().toLowerCase())) {
  //     filteredCourtsList.push(value);
  //     // }
  //   });
  //   return filteredCourtsList;
  // }
  // }

  private getCourtsTableBody(filteredCourts: any) {
    let tableData = '';
    $.each(filteredCourts,function(index,value) {
      function getDataStructure(name: string, updatedAt: string, displayed: string, slug: string): string {
        return ' <tr class="govuk-table__row">' +
          ' <td scope="row" class="govuk-table__cell">' + name + ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' + (displayed ? '' : 'closed') + ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' + updatedAt + ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' +
          '   <a id="view-"' + slug + ' class="govuk-link" href="/courts/"' + slug + '>view</a>' +
          ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' +
          '   <a id="edit-"' + slug + ' class="govuk-link" href="/courts/' + slug + '/edit/general?name=' + name + '">edit</a>' +
          ' </td>' +
          ' </tr>';
      }

      tableData += getDataStructure(value.name, value.updated_at ?? '', value.displayed, value.slug);
    });
    return tableData;
  }
}
