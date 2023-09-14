import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, MenuProps } from 'antd';
import React, { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { SHOW_HEADER, SHOW_SIDEBAR, TITLE } from 'src/config';
import { getCurrentPath, RoutePathDefinition, useActiveRoutePaths } from 'src/lib/routing';
import { mainRoute } from 'src/routes';

const { Sider, Header } = Layout;

export function Main() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const mainStaticRoutes = mainRoute.children || [];

  const activeRoutePaths = useActiveRoutePaths(mainStaticRoutes);

  const currentPath = getCurrentPath(activeRoutePaths);

  const navItems = (rts: RoutePathDefinition[], parentPath: string = ''): MenuProps['items'] => {
    const items: MenuProps['items'] = rts
      .filter((r) => !r.hidden && r.title)
      .map((route) => {
        const { title = '', path = '', children = [], icon } = route;

        return {
          label: title as string,
          key: parentPath ? [parentPath, path].join('/') : path,
          children: children.length && navItems(children, path)?.length ? navItems(children, path) : undefined,
          icon,
        };
      });
    return items;
  };

  const navMenuItems = navItems(mainStaticRoutes);

  const marginLeft = SHOW_SIDEBAR ? (collapsed ? 80 : 256) : 0;

  return (
    <Layout hasSider style={{ height: '100vh', minWidth: '1680px', overflowX: 'auto' }}>
      {SHOW_SIDEBAR && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={256}
          style={{
            overflow: 'hidden',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <Logo>
            <Image />
            {!collapsed && <span> &nbsp; {TITLE}</span>}
          </Logo>

          <StyledMenu
            theme="dark"
            mode="inline"
            items={navMenuItems}
            selectedKeys={currentPath}
            defaultOpenKeys={activeRoutePaths.length > 1 ? [activeRoutePaths[0].definition.path as string] : undefined}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
      )}

      <Layout style={{ marginLeft }}>
        {SHOW_HEADER && (
          <StyledHeader
            style={{
              width: collapsed ? 'calc(100vw - 80px)' : 'calc(100vw - 256px)',
            }}
          >
            <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
              })}
              <Breadcrumb style={{ marginLeft: 24 }}>
                {activeRoutePaths
                  .filter((p) => p.title)
                  .map((active, index) => {
                    return <Breadcrumb.Item key={index}>{active.title}</Breadcrumb.Item>;
                  })}
              </Breadcrumb>
            </div>
          </StyledHeader>
        )}

        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </Layout>
    </Layout>
  );
}

const Logo = styled.div`
  height: 64px;
  background: #00284d;
  color: white;
  line-height: 64px;
  padding: 0 16px;
  text-align: center;
`;

const Image = styled.img.attrs({ src: '/images/logo.png' })`
  display: inline;
  width: 32px;
  height: 32px;
  vertical-align: middle;
`;

const StyledHeader = styled(Header)`
  position: fixed;
  z-index: 100;
  /* width: calc(100vw - 256px); */
  padding: 0 12px;
  height: 48px;
  background: #ffffff !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: rgb(0 0 0 / 15%) 1.95px 1.95px 2.6px;

  .header-right {
    display: flex;
    float: right;
    align-items: center;

    .ant-avatar-icon {
      margin: 0 8px 0 24px;
    }

    .ant-badge,
    .ant-dropdown-trigger {
      cursor: pointer;
    }
  }
`;

const StyledMenu = styled(Menu)`
  height: calc(100vh - 60px);
  border-right: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  margin-top: 12px;

  &:hover {
    overflow-y: auto;
  }

  /* 设置滚动条的样式 */

  &::-webkit-scrollbar {
    width: 4px;
    height: 0;
  }

  /* 滚动槽 */

  &::-webkit-scrollbar-track {
    box-shadow: #818585;
    -webkit-box-shadow: #818585;
    border-radius: 1px;
  }

  /* 滚动条滑块 */

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #818585;
    box-shadow: #818585;
    -webkit-box-shadow: #818585;
  }

  &::-webkit-scrollbar-thumb:window-inactive {
    background: #818585;
  }
`;
