import nunjucks from 'nunjucks';

import createFilters from '../../../../../main/modules/nunjucks/njkFilters';

describe('njkFilters', () => {
  let env: nunjucks.Environment;

  beforeEach(() => {
    env = new nunjucks.Environment();
    createFilters(env);
  });

  describe('Test the filter that creates web page titles (from a list of string)', () => {
    test('should convert an array of strings into a descriptive title', () => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const input = ['Editing', 'Aberystwyth Justice Centre'];
      const expectedOutput
        = 'Editing - Aberystwyth Justice Centre - Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(input)).toEqual(expectedOutput);
    });

    test('should not add empty strings to the title', () => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const input = ['Editing', '', 'Aberystwyth Justice Centre', '  '];
      const expectedOutput
        = 'Editing - Aberystwyth Justice Centre - Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(input)).toEqual(expectedOutput);
    });

    test.each([[[]], [['  ', '']], [['']], [['  ']], [['', '  ', '']]])(`should just return department and service when array is ${JSON.stringify('%j')}`, (testCase: string[]) => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const expectedOutput
        = 'Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(testCase)).toEqual(expectedOutput);
    });
  });

  describe('Test the filter that creates web page titles (from a string)', () => {
    test('should convert a string into a descriptive title', () => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const input = 'Bulk Edit';
      const expectedOutput
        = 'Bulk Edit - Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(input)).toEqual(expectedOutput);
    });

    test('should not an empty string to the title', () => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const input = '';
      const expectedOutput
        = 'Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(input)).toEqual(expectedOutput);
    });

    test.each(['', '  '])('should not add empty strings such as %j to the title', (testCase) => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const expectedOutput
        = 'Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(testCase)).toEqual(expectedOutput);
    });

    test('should not have empty space wrapping the title', () => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const input = ' Edit A List ';
      const expectedOutput
        = 'Edit A List - Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(input)).toEqual(expectedOutput);
    });

    test('should add string to title even if it has dashes', () => {
      const titleEnhanceFilter = env.getFilter('titleEnhancer');
      const input = 'I - have - dash';
      const expectedOutput
        = 'I - have - dash - Find a Court or Tribunal Admin Service – GOV.UK';

      expect(titleEnhanceFilter(input)).toEqual(expectedOutput);
    });
  });
});
