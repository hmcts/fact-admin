import tinymce from 'tinymce';

tinymce.init({
  selector: '.rich-editor',
  plugins : 'autolink link paste',
  menubar: '',
  toolbar: 'link bold italic underline',
  statusbar: false,
});
