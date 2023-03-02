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

export function validateStringEmailFormat(email: string): boolean {
  const regexp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  return regexp.test(email);

}

export function validateEmail(email: string): boolean {
  const regexp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  const isValid = regexp.test(email);
  return isValid;
}

export function validateUrlFormat(url: string): boolean {
  const regexp = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}'+ // domain name and extension
    '(:\\d+)?'+ // port
    '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

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

export function replaceMultipleSpaces(data: any): void {
  const dataType = typeof data;
  const nbspRegex = /&nbsp;/gm;
  const spaceRegex = / +/gm;
  if (dataType == 'object')
  {
    Object.entries(data).forEach(([k, v]) => data[k] =
      ((typeof v == 'string') ? v.replace(nbspRegex, '').replace(spaceRegex, ' ').trim() : v)
    );
  }
}
