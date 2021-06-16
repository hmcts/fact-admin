import {OpeningTime} from '../types/OpeningTime';

export const isObjectEmpty = (obj: {}): boolean => {
  return Object.keys(obj).length === 0;
};

export function validateEmail(email: string): boolean {
  const regexp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  return regexp.test(email);
}

export function validateOpeningTimeDuplicates(openingHours: OpeningTime[]): boolean {
  let hasDuplicates = false;
  for (let i = 0; i < openingHours.length - 1; i++) {
    for (let j = i + 1; j < openingHours.length; j++) {
      if (openingHours[i].type_id && openingHours[i].type_id === openingHours[j].type_id) {
        openingHours[i].isDuplicated = true;
        openingHours[j].isDuplicated = true;
        hasDuplicates = true;
      }
    }
  }
  return !hasDuplicates;
}
