import nunjucks from 'nunjucks';
import {SelectItem} from '../../types/CourtPageData';

const DEPARTMENT_SERVICE = 'Find a Court or Tribunal Admin Service – GOV.UK';
const DASH = '–';

function createFilters(env: nunjucks.Environment): void {
  env.addFilter('titleEnhancer', function (titleParts: string | string[]) {
    // Takes a string or an array of strings and joins them together with dashes.
    // Also appends information about the service. To be used in nunjucks templates to make titles more descriptive
    // Note: If an empty list or string is given as an input then the department/service will be returned.
    if (typeof titleParts === 'string') {

      const trimmedPart = titleParts.trim();

      if(trimmedPart.length === 0) {
        return DEPARTMENT_SERVICE;
      } else {
        return trimmedPart + ' ' + DASH + ' ' + DEPARTMENT_SERVICE;
      }
    } else if (Array.isArray(titleParts)) {
      const trimmedParts = titleParts.map((part) => {
        if (typeof part === 'string') {
          return part.trim();
        } else {
          return '';
        }
      }).filter(part => part !== '');
      trimmedParts.push(DEPARTMENT_SERVICE);
      return trimmedParts.join(' ' + DASH + ' ') ;
    }
  });

  env.addFilter('setAttribute', function(dictionary , key , value){
    dictionary[key] = value;
    return dictionary;
  });

  env.addFilter('is_not_a_number', function(obj) {
    return isNaN(obj);
  });

  env.addFilter('valid', function(string){
    const regExp = /[a-zA-Z]/g;
    return (!(regExp.test(string) || isNaN(string)) );

  });

  env.addFilter('selectFilter', selectFilter);
}

function selectFilter(arr: SelectItem[], selectedId: string) {
  // Set selected property on selected item
  let itemSelected = false;
  arr.forEach(si => {
    if (si.value?.toString() === selectedId?.toString()) {
      si.selected = true;
      itemSelected = true;
    } else {
      si.selected = false;
    }
  });

  // If we don't have a selected item, add an empty item and select this.
  // This means the select control will show an empty value if there is no selection or
  // if the selected item doesn't exist in the array of items in the select.
  if (!itemSelected) {
    arr.splice(0, 0, {value: '', text: '', selected: true});
  }
  return arr;
}

export default createFilters;
