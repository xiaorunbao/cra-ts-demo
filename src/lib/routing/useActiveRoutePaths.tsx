import { useLocation } from 'react-router-dom';

import { ActiveRoutePath } from './ActiveRoutePath';
import { RoutePathDefinition } from './RoutePathDefinition';
import { mapDefinitionToActivePath } from './mapDefinitionToActivePath';

export function useActiveRoutePaths(routes: RoutePathDefinition[]): ActiveRoutePath[] {
  const location = useLocation();
  const activeRoutePaths = mapDefinitionToActivePath(routes, location.pathname);
  return activeRoutePaths;
}

export function getCurrentPath(routePaths: ActiveRoutePath[]): string[] {
  let temp = '',
    result: string[] = [];

  routePaths.forEach((r) => {
    const ret = temp ? `${temp}/${r.definition.path}` : (r.definition.path as string);
    result.push(ret);
    temp = ret;
  });
  return result;
}
