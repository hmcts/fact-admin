import nunjucks from 'nunjucks';

const DEPARTMENT_SERVICE = 'Find a Court or Tribunal Admin Service – GOV.UK';
const DASH = '-';

function createFilters(env: nunjucks.Environment): void {
  // Takes a string or an array of strings and joins them together with dashes.
  // Also appends information about the service. To be used in nunjucks filters to make titles more descriptive
  // Note: If an empty list or string is given as an input then the department/service will be returned.
  env.addFilter('titleEnhancer', function (titleParts: string | string[]) {
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
}

export default createFilters;
