export function getCurrentDatePlusMinutes(time: Date, timeToAdd: number): Date {
  return new Date((changeDateToUTCDate(time)).getTime()
    + (timeToAdd * 60000));
}

export function changeDateToUTCDate(date: Date): Date {

  let year = new Date(date).getUTCFullYear();
  let month = new Date(date).getUTCMonth();
  let date_ = new Date(date).getUTCDate();
  let hours = new Date(date).getUTCHours();
  let minutes = new Date(date).getUTCMinutes();
  let seconds = new Date(date).getUTCSeconds();
  let milliseconds = new Date(date).getUTCMilliseconds();

  return new Date(year, month, date_, hours, minutes, seconds, milliseconds);
}
