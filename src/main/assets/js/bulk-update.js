import * as $ from 'jquery';

$('#selectAll').click(e => {
  $('form input[type=checkbox]').prop('checked', e.currentTarget.checked);
});

