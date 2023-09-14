import { unset, isEmpty } from 'lodash';

export function clean(obj: any, path: string) {
  unset(obj, path);
  const parent = path.replace(/\.[^/.]+$/, '');
  if (parent !== path && isEmpty(obj[parent])) clean(obj, parent);
}
