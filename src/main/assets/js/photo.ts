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
    console.log('in setUpUpdateEventHandler');
    const form = document.getElementById(this.formId);

    console.log(form);
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      console.log('in event listener');
      const oData = new FormData();
      oData.append('file', (document.getElementById('court-photo-file-upload') as HTMLInputElement).files[0]);
      console.log(oData);
      const oReq = new XMLHttpRequest();
      const slug = $('#slug').val();
      oReq.open('POST', `/courts/${slug}/photo`, true);
      // oReq.onload = function(oEvent) {
      //   if (oReq.status == 200) {
      //     console.log('Uploaded');
      //   } else {
      //     console.log('Error');
      //   }
      // };

      oReq.send(oData);

    }, false);
    // $(this.formId).on('submit', e => {
    //   e.preventDefault();
    //   const newCourtPhoto = (document.getElementById('court-photo-file-upload') as HTMLInputElement).files[0];
    //   console.log(newCourtPhoto);
    //
    //   const fd = new FormData();
    //   fd.append('file', newCourtPhoto, newCourtPhoto.name);
    //
    //   console.log(fd);
    //
    //   fd.forEach((FormDataEntryValue, key, FormData) => {
    //     console.log(FormDataEntryValue);
    //     console.log(key);
    //     console.log(FormData);
    //   });
    //
    //
    //
    //
    //   // const blobName = getBlobName(newCourtPhoto.name);
    //   // const stream = getStream(newCourtPhoto.stream());
    //   // const containerClient = blobServiceClient.getContainerClient('images');
    //   // ;
    //   // const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    //
    //
    //
    //
    //   const slug = $('#slug').val();
    //   $.ajax({
    //     url: `/courts/${slug}/photo`,
    //     method: 'post',
    //     cache: false,
    //     contentType: false,
    //     processData: false,
    //     data: {
    //       newCourtPhoto: fd,
    //       csrfToken: $(this.tabId + ' input[name="_csrf"]').val()
    //     }
    //     // xhr: function () {
    //     //   const myXhr = $.ajaxSettings.xhr();
    //     //   if (myXhr.upload) {
    //     //     // For handling the progress of the upload
    //     //     myXhr.upload.addEventListener('progress', function (e) {
    //     //       if (e.lengthComputable) {
    //     //         $('progress').attr({
    //     //           value: e.loaded,
    //     //           max: e.total,
    //     //         });
    //     //       }
    //     //     }, false);
    //     //   }
    //     //   return myXhr;
    //     // }
    //   }).done(res => {
    //     $(this.photoContentId).html(res);
    //     window.scrollTo(0, 0);
    //   }).fail(response =>
    //     AjaxErrorHandler.handleError(response, 'PUT photo failed.'));
    // });
  }

}
