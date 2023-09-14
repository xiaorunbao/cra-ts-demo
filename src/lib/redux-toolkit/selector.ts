import { get } from 'lodash';

export type Selector<S, T> = (state: S, key?: string) => T;

/**
 * Build a standard selector
 */
export function makeSelector<S, T = S>(path: string, initState: S): Selector<any, T> {
  return (state: any, key?: string) => {
    if (!path) throw new Error('path is required for selector');
    const pathWithKey = key ? `${path}.${key}` : path;

    return (get(state, pathWithKey) || initState) as T;
  };
}
