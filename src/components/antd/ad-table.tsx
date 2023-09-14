// @ts-ignore
import { RedoOutlined, FilterOutlined, PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { Table, Card, Space, Button, Tooltip, Tree, Dropdown } from 'antd';
import type { TableProps, ColumnType } from 'antd/es/table';
import { FilterValue, SorterResult, TablePaginationConfig } from 'antd/es/table/interface';
import type { DataNode } from 'antd/es/tree';
import { isArray } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { Format } from 'src/components/format';

export declare type ExtraTool = {
  icon?: React.ReactElement;
  tooltip?: string;
  handler?: () => void;
  render?: () => JSX.Element;
};

export type AdTableOnChangeOpts = {
  _limit?: number;
  _offset?: number;
  _sort?: string;
};

export type AdColumnsType<RecordType> = AdColumnType<RecordType>[];
export interface AdColumnType<RecordType> extends ColumnType<RecordType> {
  defaultHide?: boolean;
  filterDisabled?: boolean;
  compute?: (val: any, record: RecordType) => any;
  _width?: number;
  _required?: boolean;
}

interface AdTableProps<RecordType> extends Omit<Omit<TableProps<RecordType>, 'columns'>, 'onChange'> {
  columns?: AdColumnsType<RecordType>;
  columnFilterTooltip?: string; // 列筛选按钮tip
  exportTooltip?: string; // 导出按钮tip
  extraTools?: React.ReactElement; // 扩展栏，在工具栏左侧，可自定义
  customAddComponent?: React.ReactElement;
  refreshTooltip?: string; // 刷新按钮tip
  addNewTooltip?: string; // 新建按钮tip
  uploadTooltip?: string; // 上传按钮tip
  showColumnsFilter?: boolean; // 显示列筛选按钮
  tableName?: string | React.ReactElement; // 表格名称
  wrapperStyle?: React.CSSProperties;
  onChange?: (opt: AdTableOnChangeOpts) => void; // 分页、筛选、排序变化时触发
  onRefresh?: () => void; // 刷新相应
  onExport?: () => void; // 导出响应
  onAddNew?: () => void; // 新建响应
  onUpload?: () => void; // 上传响应
}

let locale = {
  emptyText: '--',
};

const ExtraButtonStyle = {
  color: '#999',
  padding: 0,
  lineHeight: 0,
};

const ExtraContainer = styled.div`
  padding: 0px 12px;
`;

function columnsToTreeData(columns: AdColumnsType<any> = []): DataNode[] {
  return columns.map((col: AdColumnType<any>) => ({
    title: col.title as string,
    key: (col.key || col.dataIndex) as string,
    disabled: col.filterDisabled,
  }));
}

const StyledCard = styled(Card)`
  .ant-card-head {
    border: 0;
    .ant-card-extra {
      padding: 8px 0;
    }
  }
`;

const getColKey = (col: AdColumnType<any>) => (col.key || col.dataIndex) as string;

export function AdTable<RecordType extends object = any>({
  columnFilterTooltip = '列筛选',
  columns = [],
  exportTooltip = '导出',
  extraTools,
  pagination,
  refreshTooltip = '刷新',
  addNewTooltip = '新建',
  uploadTooltip = '上传',
  showColumnsFilter = true,
  tableName,
  wrapperStyle,
  onExport,
  onRefresh,
  onChange,
  onAddNew,
  onUpload,
  rowKey = 'id',
  customAddComponent,
  ...rest
}: AdTableProps<RecordType>) {
  const defaultShowKeys = useMemo(
    () =>
      columns
        .filter((col: AdColumnType<RecordType>) => !col.defaultHide)
        .map((col: AdColumnType<RecordType>) => getColKey(col)),
    [columns]
  );
  const [showKeys, setShowKeys] = React.useState<string[]>(defaultShowKeys);
  const treeData = useMemo(() => columnsToTreeData(columns), [columns]);
  const showColumns = useMemo(
    () =>
      columns
        .filter((col: AdColumnType<RecordType>) => showKeys.includes(getColKey(col)))
        .map((c) => {
          const { compute, render } = c;
          if (!render && compute) {
            return {
              ...c,
              render: (val: any, record: RecordType) => {
                const formatter = (v: any) => compute(v, record);
                return <Format value={val} formatter={formatter} />;
              },
            };
          }
          if (!render && c.dataIndex) {
            return { ...c, render: (val: any) => <Format value={val} /> };
          }
          return c;
        }),
    [columns, showKeys]
  );

  const handleChange = useCallback(
    (
      pagination: TablePaginationConfig,
      _: Record<string, FilterValue | null>,
      sorter: SorterResult<RecordType> | SorterResult<RecordType>[]
    ) => {
      if (onChange) {
        const values: AdTableOnChangeOpts = {};
        const { current = 1, pageSize = 10 } = pagination;
        values._limit = pageSize;
        values._offset = (current - 1) * pageSize;

        const { field, order } = sorter as SorterResult<RecordType>;
        if (order) values._sort = `${order === 'ascend' ? '' : '-'}${isArray(field) ? field.join('.') : field}`;

        onChange(values);
      }
    },
    [onChange]
  );

  const filterTree = (
    <Card style={{ padding: 0 }} bodyStyle={{ padding: '12px 0' }}>
      <Tree
        checkable
        checkedKeys={showKeys}
        onCheck={(checkedKeys) => {
          setShowKeys(checkedKeys as string[]);
        }}
        selectable={false}
        treeData={treeData}
      />
    </Card>
  );

  return (
    <StyledCard
      title={tableName}
      style={wrapperStyle}
      bodyStyle={{
        padding: '12px 24px',
      }}
      extra={
        <Space align="center">
          <ExtraContainer>{extraTools}</ExtraContainer>

          {onAddNew && !customAddComponent && (
            <Tooltip title={addNewTooltip}>
              <Button type="link" size="large" style={ExtraButtonStyle} onClick={onAddNew}>
                <PlusOutlined />
              </Button>
            </Tooltip>
          )}

          {Boolean(customAddComponent) && customAddComponent}

          {onRefresh && (
            <Tooltip title={refreshTooltip}>
              <Button type="link" size="large" style={ExtraButtonStyle} onClick={onRefresh}>
                <RedoOutlined />
              </Button>
            </Tooltip>
          )}

          {showColumnsFilter && (
            <Tooltip title={columnFilterTooltip}>
              <Dropdown overlay={filterTree}>
                <Button type="link" size="large" style={ExtraButtonStyle}>
                  <FilterOutlined />
                </Button>
              </Dropdown>
            </Tooltip>
          )}

          {onUpload && (
            <Tooltip title={uploadTooltip}>
              <Button type="link" size="large" style={ExtraButtonStyle} onClick={onUpload}>
                <UploadOutlined />
              </Button>
            </Tooltip>
          )}

          {onExport && (
            <Tooltip title={exportTooltip}>
              <Button type="link" size="large" style={ExtraButtonStyle} onClick={onExport}>
                <DownloadOutlined />
              </Button>
            </Tooltip>
          )}
        </Space>
      }
    >
      <Table
        locale={locale}
        columns={showColumns}
        onChange={handleChange}
        rowKey={rowKey}
        pagination={
          pagination && {
            ...pagination,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }
        }
        {...rest}
      />
    </StyledCard>
  );
}
