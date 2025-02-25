import nunjucks from 'nunjucks';

const DEPARTMENT_SERVICE = 'Find a Court or Tribunal Admin Service – GOV.UK';
const DASH = '-';

function createFilters(env: nunjucks.Environment): void {
  // make a title more descriptive using the route
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
}

export default createFilters;
