import tinymce from 'tinymce';

tinymce.init({
  selector: '.rich-editor',
  plugins : 'autolink link paste, help, tabfocus',
  base_url: '/assets/tinymce', // Point to the new location of TinyMCE assets
  menubar: '',
  toolbar: 'link bold italic underline',
  help_accessibility: true,
  height : 250,
  promotion: false,
  tabfocus_elements : ':prev,:next',
});
