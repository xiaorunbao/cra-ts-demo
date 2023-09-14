// @ts-ignore
import { snakeCase, toUpper } from 'lodash';

export const upperSnakeCase = (str: string) => toUpper(snakeCase(str));

export const withSuffix = (suffix: string | number) => (str: any) => `${str}${suffix}`;

export const safeJSONParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
};
