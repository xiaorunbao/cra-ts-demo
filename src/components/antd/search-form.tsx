import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Row, Form, Grid, Col, Button, Space } from 'antd';
import React from 'react';
import styled from 'styled-components';

const { useBreakpoint } = Grid;

export interface SearchFormItem<T = any> {
  label: string;
  name: keyof T;
  inputComponent: React.ReactElement;
  placeholder?: string;
}

interface SearchFormProps<FormValues> {
  loading?: boolean;
  searchItems?: SearchFormItem[]; // 搜索栏items
  searchDefaultExpand?: boolean; // 默认搜索是否展开
  initialValues?: FormValues; // 表单默认值
  onSearch?: (values: FormValues) => void;
}

const colLayout = {
  sm: 24,
  md: 12,
  xl: 8,
  xxl: 6,
};

const SearchFormContainer = styled.div`
  width: 100%;
  margin: 12px 0 -12px 0;
`;

export function SearchForm<FormValues>({
  loading,
  searchItems = [],
  searchDefaultExpand = false,
  onSearch,
  initialValues,
}: SearchFormProps<FormValues>) {
  let itemsPerRow = 1;
  const [expand, setExpand] = React.useState(searchDefaultExpand);

  // 根据屏幕宽度计算每行显示的items数量
  const screens = useBreakpoint();

  if (screens.xxl) itemsPerRow = 4;
  else if (screens.xl) itemsPerRow = 3;
  else if (screens.md) itemsPerRow = 2;
  const showExpand = searchItems.length > itemsPerRow;

  const itemSpan = 24 / itemsPerRow;
  const operatorOffset = showExpand
    ? !expand
      ? 0
      : (itemsPerRow - (searchItems.length % itemsPerRow) - 1) * itemSpan
    : searchItems.length < itemsPerRow
    ? 0
    : (itemsPerRow - 1) * itemSpan;

  return (
    <SearchFormContainer>
      <Form
        layout="horizontal"
        wrapperCol={{ span: 18 }}
        labelCol={{ span: 6 }}
        onFinish={onSearch}
        initialValues={initialValues as any}
      >
        <Row style={{ width: '100%' }} gutter={8}>
          {searchItems?.map((item, index) => {
            if (showExpand && !expand && index !== 0 && index >= itemsPerRow - 1) {
              return null;
            }
            return (
              <Col {...colLayout} key={item.name as string}>
                <Form.Item label={item.label} name={item.name as string}>
                  {item.inputComponent}
                </Form.Item>
              </Col>
            );
          })}
          <Col {...colLayout} offset={operatorOffset}>
            <Form.Item style={{ justifyContent: showExpand ? 'flex-end' : 'flex-start' }} wrapperCol={{ span: 24 }}>
              <div style={{ width: '100%', justifyContent: showExpand ? 'flex-start' : 'flex-end', display: 'flex' }}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} style={{ marginLeft: 24 }}>
                    查 询
                  </Button>

                  {showExpand && !expand && (
                    <Button
                      type="link"
                      onClick={() => {
                        setExpand(true);
                      }}
                    >
                      展开 <DownOutlined style={{ transform: 'translateY(-3px)' }} />
                    </Button>
                  )}

                  {showExpand && expand && (
                    <Button
                      type="link"
                      onClick={() => {
                        setExpand(false);
                      }}
                    >
                      收起 <UpOutlined style={{ transform: 'translateY(-3px)' }} />
                    </Button>
                  )}
                </Space>
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </SearchFormContainer>
  );
}
