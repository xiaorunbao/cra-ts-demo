import { isNil } from 'lodash';

export function fixed(x: number | string, precision = 2) {
  if (isNil(x)) return x;
  return Number.parseFloat(x as string).toFixed(precision);
}

export function fixedN(x: number, precision = 2) {
  if (isNil(x)) return x;
  return Number.parseFloat(x.toFixed(precision));
}

export function toPercent(x: number | string, precision = 1) {
  if (isNil(x)) return x;
  return (Number.parseFloat(x as string) * 100).toFixed(precision) + '%';
}

export function withPercent(x: number | string, precision = 1) {
  if (isNil(x)) return x;
  return Number.parseFloat(x as string).toFixed(precision) + '%';
}

export const toFixed =
  (precision: number = 0) =>
  (val: any) =>
    fixed(val, precision);
