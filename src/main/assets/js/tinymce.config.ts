import tinymce from 'tinymce';

tinymce.init({
  selector: '.rich-editor',
  plugins : 'autolink link paste',
  base_url: '/assets/tinymce', // Point to the new location of TinyMCE assets
  menubar: '',
  toolbar: 'link bold italic underline',
  statusbar: false,
});
