import { RoutePathDefinition } from 'src/lib/routing';
import { RoutesRenderer } from 'src/lib/routing/RoutesRenderer';

function wrap(route: RoutePathDefinition): RoutePathDefinition {
  if (route.children) {
    return { ...route, children: route.children.map(wrap) };
  } else {
    const path = route.path ? `${route.path}/*` : route.path;
    return { ...route, path };
  }
}

export const RoutesRenderWrap = (props: { routes: RoutePathDefinition[] }) => {
  const wrappedRoutes = props.routes.map(wrap);

  //@ts-ignore
  return <RoutesRenderer routes={wrappedRoutes} />;
};
