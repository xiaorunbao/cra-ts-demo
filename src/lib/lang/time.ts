import { isNil } from 'lodash';
import moment from 'moment';

/** Duration defines duration in milliseconds, the default time unit in Javascript. */
export const enum Duration {
  MILLISECOND = 1,
  SECOND = 1000 * MILLISECOND,
  MINUTE = 60 * SECOND,
  HOUR = 60 * MINUTE,
}

/**
 * A delay promise
 * @param {Number} ms delay miliseconds
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format time
 * @param {Date} date
 */
export function ymdhms(date: string | Date | number) {
  if (isNil(date)) return date;
  if (typeof date === 'string' && isNaN(Date.parse(date))) return date;
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Format time
 * @param {Date} date
 */
export function ymd(date: string | Date | number) {
  if (isNil(date)) return date;
  if (typeof date === 'string' && isNaN(Date.parse(date))) return date;
  return moment(date).format('YYYY-MM-DD');
}
