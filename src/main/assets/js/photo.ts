import $ from 'jquery';
import {AjaxErrorHandler} from './ajaxErrorHandler';

export class PhotoController {
  private formId = '#photoForm';
  private tabId = '#photoTab';
  private photoContentId = '#photoContent';
  private deleteBtnClass = '.deletePhoto'

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
        this.setUpDeleteEventHandler();
      },
      error: (jqxhr, errorTextStatus, err) => {
        AjaxErrorHandler.handleError(jqxhr, 'GET photo failed.');
      }
    });
  }

  private setUpUpdateEventHandler(): void {
    $(this.formId).on('submit', async e => {
      e.preventDefault();
      const oldCourtPhotoExists = !!document.getElementById('current-court-photo');
      let oldCourtPhotoName = '';
      if (oldCourtPhotoExists) {
        oldCourtPhotoName = document.getElementById('current-court-photo').getAttribute('name');
      }
      const newCourtPhoto = (document.getElementById('court-photo-file-upload') as HTMLInputElement).files[0];


      const formData = new FormData();
      const csrfToken = $(this.tabId + ' input[name="_csrf"]').val();
      formData.append('name', newCourtPhoto.name);
      formData.append('photo', newCourtPhoto);
      formData.append('oldCourtPhoto', oldCourtPhotoName);
      formData.append('fileType', newCourtPhoto.type as string);
      formData.append('csrfToken', csrfToken as string);

      const slug = $('#slug').val();
      $.ajax({
        url: `/courts/${slug}/photo`,
        method: 'put',
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

  private setUpDeleteEventHandler(): void {
    $(this.tabId).on('click', `button${this.deleteBtnClass}`, e => {
      e.preventDefault();
      const oldCourtPhoto = document.getElementById('current-court-photo').getAttribute('name');
      const slug = $('#slug').val();

      $.ajax({
        url: `/courts/${slug}/photo`,
        method: 'delete',
        data: {
          oldCourtPhoto: oldCourtPhoto,
          slug: slug,
          csrfToken: $(this.tabId + ' input[name="_csrf"]').val()
        }
      }).done(res => {
        $(this.photoContentId).html(res);
        window.scrollTo(0, 0);
      }).fail(response =>
        AjaxErrorHandler.handleError(response, 'DELETE photo failed.'));
    });
  }
}
