import $ from 'jquery';

const formId = '#openingTimesForm';
const tabId = '#openingTimesTab';
const newOpeningTimeHeadingId = '#newOpeningHoursHeading';
const openingTimesContentId = '#openingTimesContent';
const deleteBtnClass = 'deleteOpeningTime';
const addOpeningTimesBtnName = 'addOpeningTime';
const typeSelectName = 'type_id';
const hoursInputName = 'hours';

const getInputName = (name: string, index: number): string => {
  return `opening_times[${index}][${name}]`;
};

// Rename the input fields so that the index values are in order,
// which affects the order when the form is posted.
const renameFormElements = (): void => {
  $(`${tabId} select[name$="[${typeSelectName}]"]`)
    .attr('name', idx => getInputName(typeSelectName, idx))
    .attr('id', idx => 'description-' + idx);
  $(`${tabId} input[name$="[${hoursInputName}]"]`)
    .attr('name', idx => getInputName(hoursInputName, idx))
    .attr('id', idx => 'hours-' + idx);
};

$(() => {
  if($(tabId).length > 0) {

    // GET the opening-hours data for a court
    const slug = $('#slug').val();
    $.ajax({
      url: `/courts/${slug}/opening-times`,
      method: 'get',
      success: (res) => {
        $(openingTimesContentId).html(res);
      },
      error: (jqxhr, errorTextStatus, err) =>
        console.log(`GET opening times failed: ${errorTextStatus} ${err}`)
    });

    // POST the opening-hours form for a court
    $(formId).on('submit', e => {
      e.preventDefault();

      const url = $(e.target).attr('action');
      $.post(url, $(e.target).serialize())
        .done(res => {
          $(openingTimesContentId).html(res);
          window.scrollTo(0,0);
        })
        .fail(response =>
          console.log(`POST opening times failed: ${response.status} ${response.responseText}`));
    });

    // Remove an opening-hours entry
    $(tabId).on('click', `button.${deleteBtnClass}`, e => {
      e.target.closest('fieldset').remove();
      renameFormElements();
    });

    // Add an opening-hours entry
    $(tabId).on('click', `button[name="${addOpeningTimesBtnName}"]`, e => {
      // Copy new opening hours fields to main table.
      const addNewFieldset = e.target.closest('fieldset');
      const copyFieldset = $(addNewFieldset).clone();
      $(`${newOpeningTimeHeadingId}`).before(copyFieldset);

      // Set the value of the select to that chosen in 'add new'.
      const type = $(addNewFieldset).find('select').val();
      $(copyFieldset).find('select')
        .val(type)
        .attr('name', getInputName(typeSelectName, 0));
      $(copyFieldset).find('input').attr('name', getInputName(hoursInputName, 0));

      // Set the id and names of the elements in the table
      renameFormElements();

      // Change button type in newly added row from 'add' to 'delete'.
      $(copyFieldset).find('button').replaceWith(
        '<button type="button" name="deleteOpeningHours" ' +
        `class="govuk-button govuk-button--secondary ${deleteBtnClass}" data-module="govuk-button">Remove</button>`);

      // Reset select and input values on 'add new' row.
      $(addNewFieldset).find('input, select').val('');
    });
  }
});
