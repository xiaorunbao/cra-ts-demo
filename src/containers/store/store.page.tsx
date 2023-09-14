import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Table } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { StoreTypeI18N } from 'src/features/pet-store';
import { Page } from 'src/layouts';
import { useSlice } from 'src/lib/redux-toolkit';
import { Store, StoreType } from 'src/sdk/petstore';

import { PetEditModal } from './pet-edit.modal';
import { listStoreSlice, storeSlice } from './slice';

function StorePage() {
  const dispatch = useDispatch();

  const [{ editMode }, { setEditMode }] = useSlice(storeSlice);
  const [{ result: stores = [], loading }, listStores] = useSlice(listStoreSlice);

  useEffect(() => {
    dispatch(
      listStores.request({
        _limit: 10,
        _offset: 0,
      })
    );
  }, []);

  const columns: ColumnType<Store>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '地址',
      dataIndex: 'address',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (val: StoreType) => StoreTypeI18N[val],
    },
  ];

  return (
    <Page>
      <Card
        extra={
          <Button
            type="primary"
            onClick={() => {
              dispatch(setEditMode('create'));
            }}
          >
            <PlusOutlined />
            添加商店
          </Button>
        }
      >
        <Table dataSource={stores} columns={columns} loading={loading} />
      </Card>
      {editMode && <PetEditModal />}
    </Page>
  );
}

export default StorePage;
