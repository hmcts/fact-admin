import $ from 'jquery';

export class CourtsController {

  private contentId = '#main-content';
  private toggleCourts = 'toggleClosedCourtsDisplay';
  private searchCourtsFilter = 'searchCourts';
  private searchCourtsFilterId = '#searchCourts';
  private courtsHiddenId = 'courtsHidden';
  // private courtsHiddenFilteredId = 'courtsHiddenFiltered';
  private courtsResults = 'courtsResults';
  private TABLE_HEADER = '    <table class="govuk-table" id="courtsResults">' +
    '      <thead class="govuk-table__head">' +
    '        <tr class="govuk-table__row">' +
    '          <th scope="col" class="govuk-table__header">Name</th>' +
    '          <th scope="col" class="govuk-table__header">Last Updated</th>' +
    '          <th scope="col" class="govuk-table__header"></th>' +
    '          <th scope="col" class="govuk-table__header"></th>' +
    '        </tr>' +
    '      </thead>';
  private TABLE_BODY_START = ' <tbody class="govuk-table__body">';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      this.setUpTableData((document.getElementById(this.courtsHiddenId) as HTMLInputElement).value);
      this.setUpToggleClosedCourtsDisplay();
      this.setUpCourtsDynamicSearchFilter();
    });
  }

  private setUpToggleClosedCourtsDisplay(): void {
    $(this.contentId).on('change', `input[name=${this.toggleCourts}]`, e => {
      e.preventDefault();
      console.log('test this hits');
    });
  }

  private setUpCourtsDynamicSearchFilter(): void {
    $(this.contentId).on('input', `input[name=${this.searchCourtsFilter}]`, e => {
      e.preventDefault();

      const filterValue = $(this.searchCourtsFilterId).val();

      const courts = (document.getElementById(this.courtsHiddenId) as HTMLInputElement).value;

      const filteredCourtsList: (string | number | symbol)[] = [];
      $.each(JSON.parse(courts),function(index,value){

        if(value.name.toLowerCase().includes(filterValue.toString().toLowerCase())) {
          console.log('match found!: ' + value);
          filteredCourtsList.push(value);
        }
      });

    });
  }

  private setUpTableData(courts: string) {

    // const filterValue = $(this.searchCourtsFilterId).val();
    //

    let tableBody = this.TABLE_HEADER + this.TABLE_BODY_START;

    const string = this.parameterizedString('my name is %s1 and surname is %s2', ['John', 'Doe']);
    console.log(string);

    $.each(JSON.parse(courts).sort((a: { name: string }, b: { name: string }) =>
      (a.name > b.name) ? 1 : -1),function(index,value) {

      // if(filterValue && value.name.toLowerCase().includes(filterValue.toString().toLowerCase())) {
      //   console.log('match found!: ' + value);
      //   filteredCourtsList.push(value);
      // }

      const name = value.name;
      const updatedAt = value.updated_at ?? '';
      // const displayed = value.displayed;
      const slug = value.slug;

      tableBody += ' <tr class="govuk-table__row">' +
        ' <td scope="row" class="govuk-table__cell">' + name + ' </td>' +
        ' <td scope="row" class="govuk-table__cell">' + updatedAt + ' </td>' +
        ' <td scope="row" class="govuk-table__cell">' +
        '   <a id="view-"' + slug + ' class="govuk-link" href="/courts/"' + slug + '>view</a>' +
        ' </td>' +
        ' <td scope="row" class="govuk-table__cell">' +
        '   <a id="edit-"' + slug + ' class="govuk-link" href="/courts/' + slug + '/edit/general?name=' + name + '">edit</a>' +
        ' </td>' +
        ' </tr>';
    });

    tableBody += '</tbody> </table>';

    (document.getElementById(this.courtsResults) as HTMLElement).outerHTML = tableBody;
  }

  /***
   * @example parameterizedString("my name is %s1 and surname is %s2", "John", "Doe");
   * @return "my name is John and surname is Doe"
   *
   * @firstArgument {String} like "my name is %s1 and surname is %s2"
   * @otherArguments {String | Number}
   * @returns {String}
   */
  private parameterizedString = (str: string, values: string[]) => {
    if (!str) return '';
    return str.replace(/%s[0-9]+/g, matchedStr => {
      // const variableIndex = matchedStr.replace('%s', '') - 1;
      const variableIndex = <any> matchedStr.replace('%s', '') -1;
      return values[variableIndex];
    });
  }
}
