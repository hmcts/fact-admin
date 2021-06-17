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
