import {Abbreviation} from '../types/Abbreviation';

const road: Abbreviation = { name:'road', abbreviation: 'rd'};
const street: Abbreviation = { name:'street', abbreviation: 'st'};
const avenue: Abbreviation = { name:'avenue', abbreviation: 'ave'};

const AddressUtils: Abbreviation[] = [road, street, avenue];

export function replaceAbbreviations(searchString: string): string {
  const searchStrings = searchString.toLowerCase().split(' ');
  searchStrings.forEach( (str,idx) => {
    AddressUtils.map(abr => abr.abbreviation).forEach(abr => {
      if (str === abr) {
        searchStrings[idx] = AddressUtils.filter(ab => ab.abbreviation === abr)[0].name;
      }
    });

  });

  return searchStrings.join(' ');
}

export function removeSpecialCharacters(addressLines: string[]): string[]{
  const stringArray : string[] = [];
  addressLines.forEach(line => {
    line = replaceAbbreviations(line);
    stringArray.push(line.replace(/[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~]/g, ''));
  });
  return stringArray;
}

export function compareAddressLines(address1Lines: string[], address2Lines: string[]): boolean {
  const check: boolean[] = [];
  address1Lines.forEach(address1Line => {
    address2Lines.forEach(address2Line => {
      if(address1Line.trim().toLowerCase() === address2Line.trim().toLowerCase()) check.push(true);
    });
  });
  return check.length === address1Lines.length;
}
