import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'moment';
import 'moment/locale/zh-cn';
import { Suspense } from 'react';

import './app.less';
import { RoutesRenderWrap, staticRoutes } from './routes';

function App() {
  return (
    <Suspense fallback={<Spin />}>
      <ConfigProvider locale={zhCN}>
        <RoutesRenderWrap routes={staticRoutes} />
      </ConfigProvider>
    </Suspense>
  );
}

export default App;
