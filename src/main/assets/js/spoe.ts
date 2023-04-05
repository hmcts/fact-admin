import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {SpoeAreaOfLaw} from '../../types/SpoeAreaOfLaw';
import {setUpTabClick} from './tab-reset';

export class SpoeController {
  private formId = '#spoeForm';
  private tabId = '#spoeTab';
  private spoeContentId = '#spoeContent';
  private tab = '#tab_spoe';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        setUpTabClick(this.tab, this.getSpoeAreasOfLaw.bind(this));
        this.getSpoeAreasOfLaw();
        this.setUpUpdateEventHandler();
      }
    });
  }

  private getSpoeAreasOfLaw(): void {
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/spoe`,
      method: 'get',
      success: (res) => {
        $(this.spoeContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET spoe cases heard failed.');
      }
    });
  }

  private setUpUpdateEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const slug = $('#slug').val();
      const updatedCourtSpoeAreasOfLaw = SpoeController.getSelectedSpoeAreasOfLaw($(e.target.getElementsByTagName('input')));
      const allSpoeAreasOfLaw = SpoeController.getAllSpoeAreasOfLaw($('[data-inputType="spoe-area-of-law"]'));
      $.ajax({
        url: `/courts/${slug}/spoe`,
        method: 'put',
        data: {
          courtSpoeAreasOfLaw: updatedCourtSpoeAreasOfLaw,
          allSpoeAreasOfLaw: allSpoeAreasOfLaw,
          csrfToken: $(this.tabId + ' input[name="_csrf"]').val()
        }
      }).done(res => {
        $(this.spoeContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUTS court spoe areas of law failed.'));
    });
  }

  private static getSelectedSpoeAreasOfLaw(elementList: JQuery): SpoeAreaOfLaw[] {
    return $.map(elementList, function(value: HTMLElement){
      if ($(value).prop('checked')) {
        return { id: parseInt(value.dataset.id),name: value.getAttribute('value'), singlePointEntry: true} as SpoeAreaOfLaw;
      }
    });
  }

  private static getAllSpoeAreasOfLaw(elementList: JQuery): SpoeAreaOfLaw[] {
    return $.map(elementList, function(value: HTMLElement){
      return { id: parseInt(value.dataset.id),name: value.getAttribute('value'), singlePointEntry: true} as SpoeAreaOfLaw;
    });
  }
}

