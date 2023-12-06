export function getCurrentDatePlusMinutes(time: Date, timeToAdd: number): Date {
  return new Date((changeDateToUTCDate(time)).getTime()
    + (timeToAdd * 60000));
}

export function changeDateToUTCDate(date: Date): Date {

  const year = new Date(date).getUTCFullYear();
  const month = new Date(date).getUTCMonth();
  const date_ = new Date(date).getUTCDate();
  const hours = new Date(date).getUTCHours();
  const minutes = new Date(date).getUTCMinutes();
  const seconds = new Date(date).getUTCSeconds();
  const milliseconds = new Date(date).getUTCMilliseconds();

  return new Date(year, month, date_, hours, minutes, seconds, milliseconds);
}
