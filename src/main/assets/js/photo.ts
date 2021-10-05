import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
// import { BlobServiceClient } from '@azure/storage-blob';
// import config from "config";

export class PhotoController {
  private formId = '#photoForm';
  private tabId = '#photoTab';
  private photoContentId = '#photoContent';

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        this.getPhoto();
      }
    });
  }

  private getPhoto(): void {
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/photo`,
      method: 'get',
      success: async (res) => {
        await $(this.photoContentId).html(res);
        this.setUpUpdateEventHandler();
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET photo failed.');
      }
    });
  }

  private setUpUpdateEventHandler(): void {
    $(this.formId).on('submit', e => {
      e.preventDefault();
      const newCourtPhoto = (document.getElementById('court-photo-file-upload') as HTMLInputElement).files[0];
      console.log(newCourtPhoto);

      const formData = new FormData();
      const csrfToken = $(this.tabId + ' input[name="_csrf"]').val();
      formData.append('name', newCourtPhoto.name);
      formData.append('photo', newCourtPhoto, newCourtPhoto.name);
      formData.append('csrfToken', csrfToken as string);

      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/photo`,
        method: 'post',
        processData: false,
        contentType: false,
        data: formData
      }).done(res => {
        $(this.photoContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'PUT photo failed.'));
    });
  }
}
