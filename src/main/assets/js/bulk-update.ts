import $ from 'jquery';

$('#selectAll').on('click', e => {
  const target = e.currentTarget as HTMLInputElement;

  $('form input[type=checkbox]').prop('checked', target.checked);
});

