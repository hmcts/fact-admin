export function getCurrentDatePlusMinutes(time: Date, timeToAdd: number): Date {
  return new Date((new Date(time)).getTime()
    + (timeToAdd * 60000));
}
