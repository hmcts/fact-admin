import {Email} from '../types/Email';
import {Element} from '../types/Element';

export const isObjectEmpty = (obj: {}): boolean => {
  return Object.keys(obj).length === 0;
};

export function validateEmailFormat(emails: Email[]): boolean {
  const regexp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  let hasInvalidFormat = false;
  for (let i = 0; i < emails.length; i++) {
    const isValid = regexp.test(emails[i].address);
    if (!isValid) {
      emails[i].isInvalidFormat = true;
      hasInvalidFormat = true;
    }
  }
  return !hasInvalidFormat;
}

export function validateUrlFormat(url: string): boolean {
  const regexp = new RegExp(/^(https?:\/\/)?((([A-Za-z\d]([A-Za-z\d-]*[A-Za-z\d])*)\.)+[A-Za-z]{2,}|((\d{1,3}\.){3}\\d{1,3}))(\:\d+)?(\/[-A-Za-z\d%_.~+]*)*(\?[;&A-Za-z\d%_.~+=-]*)?(\#[-A-Za-z\d_]*)?$/);
  return regexp.test(url);
}

export function validateDuplication(elements: Element[], predicate: (elements: Element[], b: number, c: number) => boolean): boolean {
  let hasDuplicates = false;
  for (let i = 0; i < elements.length - 1; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (predicate(elements, i, j)) {
        elements[i].isDuplicated = true;
        elements[j].isDuplicated = true;
        hasDuplicates = true;
      }
    }
  }
  return !hasDuplicates;
}

export function validateNameDuplication(elements: Element[], predicate: (elements: Element[], b: number, c: number) => boolean): boolean {
  let hasDuplicates = false;
  for (let i = 0; i < elements.length - 1; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (predicate(elements, i, j)) {
        elements[i].isNameDuplicated = true;
        elements[j].isNameDuplicated = true;
        hasDuplicates = true;
      }
    }
  }
  return !hasDuplicates;
}

export function postcodeIsValidFormat(postcode: string): boolean {
  const postcodeRegex = new RegExp('([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|' +
    '(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))' +
    '\\s?[0-9][A-Za-z]{2})', 'g');

  const match = postcode.match(postcodeRegex);
  return match?.length === 1 && match[0] === postcode;
}
