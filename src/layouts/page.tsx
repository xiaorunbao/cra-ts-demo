import React from 'react';
import styled from 'styled-components';

import { SHOW_HEADER } from 'src/config';

const PageContainer = styled.div`
  margin-top: ${SHOW_HEADER ? '74px' : '0'};
  width: 100%;
  height: 100%;
`;

interface PageProps {}

export function Page({ children }: React.PropsWithChildren<PageProps>) {
  return <PageContainer>{children}</PageContainer>;
}
