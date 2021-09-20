import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  newPipeline
} from '@azure/storage-blob';
import config from "config";


export class PhotoController {
  // private formId = '#photoForm';
  private tabId = '#photoTab';
  private photoContentId = '#photoContent';

  constructor() {
    console.log('In photoController constructor');
    this.initialize();
  }

  private initialize(): void {
    $(() => {
      if ($(this.tabId).length > 0) {
        console.log('In photoController initialize');
        this.getPhoto();
      }
    });
  }



  private getPhoto(): void {
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/photo`,
      method: 'get',
      success: (res) => {
        $(this.photoContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET photo failed.');
      }
    });
  }


}
