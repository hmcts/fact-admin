import $ from 'jquery';

export class BulkUpdateController {

  private contentId = '#main-content';
  private selectAllId = '#selectAll';


  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {

      this.setUpSelectAllCourts();
    });
  }

  private setUpSelectAllCourts(): void {
    $(this.contentId).on('click', `${this.selectAllId}`, e => {
      const target = e.currentTarget as HTMLInputElement;
      $('form input[type=checkbox][name="courts"]:visible').prop('checked', target.checked);
    });
  }
}

