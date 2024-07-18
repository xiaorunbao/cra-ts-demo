import { GithubOutlined, HomeOutlined, TaobaoOutlined } from '@ant-design/icons';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

import { Main } from 'src/layouts/main';
import { RoutePathDefinition } from 'src/lib/routing';

const HomePage = lazy(() => import('src/containers/home/home.page'));
const PetPage = lazy(() => import('src/containers/pet/pet.page'));
const StorePage = lazy(() => import('src/containers/store/store.page'));

export const mainRoute: RoutePathDefinition = {
  path: '/',
  element: <Main />,
  children: [
    { index: true, element: <Navigate to="/home" replace /> },
    { title: '首页', path: 'home', icon: <HomeOutlined />, element: <HomePage /> },
    { title: '宠物', path: 'pet', icon: <GithubOutlined />, element: <PetPage /> },
    { title: '商店', path: 'store', icon: <TaobaoOutlined />, element: <StorePage /> },
  ],
};

export const staticRoutes: RoutePathDefinition[] = [
  mainRoute,
  { title: '禁止访问', path: '/403', element: <div>403 无权访问</div> }, // 实现一个 403 页面
];
