import $ from 'jquery';

export class CourtsController {

  private contentId = '#main-content';
  private toggleCourts = 'toggleClosedCourtsDisplay';
  private numberOfCourts = '#numberOfCourts';
  private searchCourtsFilter = 'searchCourts';
  private searchCourtsFilterId = '#searchCourts';
  private courtsHiddenId = 'courtsHidden';
  private courtsNameAscToggleId = '#courtsNameAscToggle';
  private courtsUpdatedAscToggleId = '#courtsUpdatedAscToggle';
  private courtsResults = 'courtsResults';
  private TABLE_HEADER = ' <table class="govuk-table" id="courtsResults">' +
    ' <thead class="govuk-table__head">' +
    '   <tr class="govuk-table__row">' +
    '     <th id="tableCourtsName" scope="col" ' +
    '       class="govuk-table__header govuk-!-width-one-half courts-table-header-inactive">Name</th>' +
    '     <th scope="col" class="govuk-table__header"></th>' +
    '     <th id="tableCourtsUpdated" scope="col" ' +
    '       class="govuk-table__header courts-table-header-inactive">Last Updated</th>' +
    '     <th scope="col" class="govuk-table__header"></th>' +
    '     <th scope="col" class="govuk-table__header"></th>' +
    '   </tr>' +
    ' </thead>';
  private TABLE_BODY_START = ' <tbody class="govuk-table__body">';
  private TABLE_HEADER_BODY_END = '</tbody> </table>';
  private tableCourtsNameId = '#tableCourtsName';
  private tableCourtsUpdatedId = '#tableCourtsUpdated';
  private orderToggleState = {
    ASC: 'ASC',
    DESC: 'DESC',
    INACTIVE: 'INACTIVE'
  }

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      this.setUpTableData((document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        '', false, this.orderToggleState.ASC, this.orderToggleState.INACTIVE);
      this.switchTableClasses($(this.courtsNameAscToggleId), $(this.tableCourtsNameId), $(this.tableCourtsUpdatedId));
      this.setUpToggleClosedCourtsDisplay();
      this.setUpCourtsDynamicSearchFilter();
      this.setUpAscDecNameFilter();
      this.setUpAscDecUpdatedDateFilter();
    });
  }

  private setUpToggleClosedCourtsDisplay(): void {
    $(this.contentId).on('change', `input[name=${this.toggleCourts}]`, e => {
      e.preventDefault();

      const courtsUpdatedAscToggleId = $(this.courtsUpdatedAscToggleId);
      const courtsNameAscToggleId = $(this.courtsNameAscToggleId);

      this.setUpTableData((document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        $(this.searchCourtsFilterId).val() as string,
        $('#main-content input[name="toggleClosedCourtsDisplay"]').prop('checked'),
        $(this.courtsNameAscToggleId).val() as string,
        courtsUpdatedAscToggleId.val() as string);

      courtsUpdatedAscToggleId.val() == this.orderToggleState.INACTIVE ?
        this.switchTableClasses(courtsNameAscToggleId,
          $(this.tableCourtsNameId), $(this.tableCourtsUpdatedId)) :
        this.switchTableClasses(courtsUpdatedAscToggleId,
          $(this.tableCourtsUpdatedId), $(this.tableCourtsNameId));
    });
  }

  private setUpCourtsDynamicSearchFilter(): void {
    $(this.contentId).on('input', `input[name=${this.searchCourtsFilter}]`, e => {
      e.preventDefault();
      this.setUpTableData((document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        $(this.searchCourtsFilterId).val() as string,
        $('#main-content input[name="toggleClosedCourtsDisplay"]').prop('checked'),
        $(this.courtsNameAscToggleId).val() as string, $(this.courtsUpdatedAscToggleId).val() as string);
      this.switchTableClasses($(this.courtsNameAscToggleId),
        $(this.tableCourtsNameId), $(this.tableCourtsUpdatedId));
    });
  }

  private setUpAscDecNameFilter(): void {
    $(this.contentId).on('click', `${this.tableCourtsNameId}`, e => {
      e.preventDefault();
      this.switchTableToggle($(this.courtsNameAscToggleId), $(this.courtsUpdatedAscToggleId));
      this.setUpTableData(
        (document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        $(this.searchCourtsFilterId).val() as string,
        $('#main-content input[name="toggleClosedCourtsDisplay"]').prop('checked'),
        $(this.courtsNameAscToggleId).val() as string,
        $(this.courtsUpdatedAscToggleId).val() as string);
      this.switchTableClasses($(this.courtsNameAscToggleId),
        $(this.tableCourtsNameId), $(this.tableCourtsUpdatedId));
    });
  }

  private setUpAscDecUpdatedDateFilter(): void {
    $(this.contentId).on('click', `${this.tableCourtsUpdatedId}`, e => {
      e.preventDefault();
      this.switchTableToggle($(this.courtsUpdatedAscToggleId), $(this.courtsNameAscToggleId));
      this.setUpTableData(
        (document.getElementById(this.courtsHiddenId) as HTMLInputElement).value,
        $(this.searchCourtsFilterId).val() as string,
        $('#main-content input[name="toggleClosedCourtsDisplay"]').prop('checked'),
        $(this.courtsNameAscToggleId).val() as string,
        $(this.courtsUpdatedAscToggleId).val() as string);
      this.switchTableClasses($(this.courtsUpdatedAscToggleId),
        $(this.tableCourtsUpdatedId), $(this.tableCourtsNameId));
    });
  }

  private setUpTableData(courts: string, searchFilterValue: string, includeClosedCourts: boolean,
    orderNameAscendingFilter: string, orderUpdatedAscendingFilter: string): void {
    let tableBody = this.TABLE_HEADER + this.TABLE_BODY_START;
    const filteredCourts = this.filterCourts(courts, searchFilterValue, includeClosedCourts,
      orderNameAscendingFilter, orderUpdatedAscendingFilter);
    tableBody += this.getCourtsTableBody(filteredCourts) + this.TABLE_HEADER_BODY_END;
    (document.getElementById(this.courtsResults) as HTMLElement).outerHTML = tableBody;
    searchFilterValue.length ? $(this.numberOfCourts).show().text(
      'Showing ' + filteredCourts.length + ' results')
      : $(this.numberOfCourts).hide();
  }

  private filterCourts(courts: string, searchFilterValue: string, includeClosedCourts: boolean,
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
          case this.orderToggleState.ASC:
            return (a.name > b.name) ? 1 : -1;
          case this.orderToggleState.DESC:
            return (a.name < b.name) ? 1 : -1;
          case this.orderToggleState.INACTIVE:
            break;
        }

        switch (orderUpdatedAscendingFilter) {
          case this.orderToggleState.ASC:
            return (Date.parse(a.updated_at) > Date.parse(b.updated_at)) ? 1 : -1;
          case this.orderToggleState.DESC:
            return (Date.parse(a.updated_at) < Date.parse(b.updated_at)) ? 1 : -1;
          case this.orderToggleState.INACTIVE:
            break;
        }
      }));
  }

  private getCourtsTableBody(filteredCourts: any): string {
    let tableData = '';
    $.each(filteredCourts,function(index,value) {
      function getDataStructure(name: string, updatedAt: string, displayed: string, slug: string, frontendUrl: string): string {
        return ' <tr class="govuk-table__row">' +
          ' <td scope="row" class="govuk-table__cell">' + name + ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' + (displayed ? '' : 'closed') + ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' + updatedAt + ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' +
          '   <a id="view-"' + slug + ' class="govuk-link" href="' + frontendUrl +  '/courts/' + slug + '">view</a>' +
          ' </td>' +
          ' <td scope="row" class="govuk-table__cell">' +
          '   <a id="edit-"' + slug + ' class="govuk-link" href="/courts/' + slug + '/edit#general">edit</a>' +
          ' </td>' +
          ' </tr>';
      }

      tableData += getDataStructure(value.name, value.updated_at ?? '', value.displayed, value.slug,
        $('#courtsFrontendUrl').val() as string);
    });

    return tableData;
  }

  private switchTableToggle(toToggle: JQuery, toReset: JQuery): void {
    const toggleUpdatedVal = toToggle.val();

    switch (toggleUpdatedVal) {
      case this.orderToggleState.ASC: {
        toToggle.val(this.orderToggleState.DESC);
        break;
      }
      case this.orderToggleState.DESC: {
        toToggle.val(this.orderToggleState.ASC);
        break;
      }
      case this.orderToggleState.INACTIVE: {
        toToggle.val(this.orderToggleState.ASC);
        break;
      }
    }

    toReset.val(this.orderToggleState.INACTIVE);
  }

  private switchTableClasses(tableState: JQuery, thToToggle: JQuery, thToReset: JQuery): void {
    switch (tableState.val()) {
      case this.orderToggleState.ASC: {
        thToToggle.removeClass('courts-table-header-inactive')
          .removeClass('courts-table-header-asc')
          .addClass('courts-table-header-desc');
        break;
      }
      case this.orderToggleState.DESC: {
        thToToggle.removeClass('courts-table-header-inactive')
          .removeClass('courts-table-header-desc')
          .addClass('courts-table-header-asc');
        break;
      }
      case this.orderToggleState.INACTIVE: {
        thToToggle.removeClass('courts-table-header-inactive')
          .addClass('courts-table-header-asc');
        break;
      }
    }

    thToReset.removeClass('courts-table-header-asc')
      .removeClass('courts-table-header-desc')
      .addClass('courts-table-header-inactive');
  }
}
