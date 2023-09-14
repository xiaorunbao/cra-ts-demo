import React from 'react';
import { RouteObject } from 'react-router-dom';

import { ActiveRoutePathTitleCallback } from './ActiveRoutePathTitleCallback';

export type RoutePathDefinition = Omit<RouteObject, 'children'> & {
  title?: string | ActiveRoutePathTitleCallback;
  hidden?: boolean; // 是否在导航上显示 默认是 false
  children?: RoutePathDefinition[]; // children 的类型定义不对，不知道该怎么处理
  path?: string;
  icon?: React.ReactNode; // 图标
  roles?: string[]; // 该route下所需的角色
};
