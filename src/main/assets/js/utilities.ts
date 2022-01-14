import $ from 'jquery';
import tinymce from 'tinymce';

export class Utilities {

  // Fieldsets that can be re-ordered are expected to have this class
  private static fieldsetReorderSelector = 'fieldset.can-reorder';

  /**
   * Adds re-ordering of fieldsets to an area of the page by attaching click event handlers to move up and
   * move down buttons within the fieldset.
   * The fieldset must include the 'can-reorder' class to be re-ordered.
   * @param tabId The ID of the container where reordering is required.
   * @param upButtonClass The class for the 'move up' buttons.
   * @param downButtonClass The class for the 'move down' buttons.
   * @param callback Optional callback - called after the reordering has taken place.
   **/
  public static addFieldsetReordering(
    tabId: string,
    upButtonClass: string,
    downButtonClass: string,
    callback?: Function): void {

    if (upButtonClass) {
      this.addUpReordering(tabId, upButtonClass, callback);
    }

    if (downButtonClass) {
      this.addDownReordering(tabId, downButtonClass, callback);
    }
  }

  private static addUpReordering(tabId: string, upButtonClass: string, callback?: Function): void {
    $(tabId).on('click', `button.${upButtonClass}`, e => {
      const entryToMove = e.target.closest(this.fieldsetReorderSelector);
      const previousEntry = $(entryToMove).prev(this.fieldsetReorderSelector);

      if (previousEntry.length === 1) {
        $(entryToMove).insertBefore(previousEntry);
        if (callback) {
          callback();
        }
      }
    });
  }

  private static addDownReordering(tabId: string, downButtonClass: string, callback?: Function): void {
    $(tabId).on('click', `button.${downButtonClass}`, e => {
      const entryToMove = e.target.closest(this.fieldsetReorderSelector);
      const nextEntry = $(entryToMove).next(this.fieldsetReorderSelector);

      if (nextEntry.length === 1) {
        $(entryToMove).insertAfter(nextEntry);
        if (callback) {
          callback();
        }
      }
    });
  }

  /**
   * Return a list of checkbox ids that have been selected
   * @param elementList a list of checked boxes
   */
  public static getSelectedItemsIds(elementList: JQuery): string[] {
    return $.map(elementList, function(value: HTMLElement){
      if ($(value).prop('checked')) {
        return [value.id];
      }
    });
  }

  /**
   * Return a true or false depending on whether or not a checkbox has been selected or not
   * @param selector: the selector for the checkbox
   * @param textToSearch: the text of the element to check
   */
  public static isCheckboxItemSelected(selector: string, textToSearch: string): boolean {
    let result = false;
    $(selector).each(function(){
      if ($(this).prop('checked')) {
        if ($(this).val().toString().indexOf(textToSearch) >= 0) {
          result = true;
        }
      }
    });
    return result;
  }

  public static toggleTabEnabled(tabId: string, isEnabled: boolean): void{
    if(!isEnabled) {
      $(tabId).addClass('disable-tab');
      $(tabId).attr('disabled') ;
    }
    else
    {
      $(tabId).removeClass('disable-tab');
      $(tabId).removeAttr('disabled') ;
    }
  }

  public static async setUpTinymce() {
    tinymce.remove();
    await tinymce.init({
      selector: '.rich-editor',
      plugins: 'autolink link paste ',
      menubar: '',
      toolbar: 'link bold italic underline',
      height: 120,
      statusbar: false,
    });

    await tinymce.init({
      selector: '.urgent-notice-rich-editor',
      plugins: 'autolink link paste ',
      menubar: '',
      toolbar: 'link',
      height: 120,
      statusbar: false,
    });
  }
}
