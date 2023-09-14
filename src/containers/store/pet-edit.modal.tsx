import { Form, Input, Modal } from 'antd';
import { useDispatch } from 'react-redux';

import { StoreTypeSelect } from 'src/features/pet-store';
import { useSlice } from 'src/lib/redux-toolkit';
import { CreateStoreDto } from 'src/sdk/petstore';

import { createStoreSlice, storeSlice } from './slice';

export function PetEditModal() {
  const dispatch = useDispatch();

  const [{ editMode }, { setEditMode }] = useSlice(storeSlice);
  const [{ loading }, createStore] = useSlice(createStoreSlice);
  const [form] = Form.useForm();

  const handleSubmit = (values: CreateStoreDto) => {
    console.log(values);
    dispatch(
      createStore.request({
        body: values,
      })
    );
  };

  return (
    <Modal
      open
      maskClosable={false}
      onCancel={() => {
        dispatch(setEditMode(undefined));
      }}
      onOk={() => {
        form.submit();
      }}
      title={editMode === 'create' ? '新建宠物店' : '编辑宠物店'}
      okButtonProps={{
        loading,
      }}
      cancelButtonProps={{
        loading,
      }}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        style={{ marginTop: 24 }}
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 20,
        }}
      >
        <Form.Item label="名称" rules={[{ required: true, message: '请输入名称' }]} name="name">
          <Input placeholder="请输入" />
        </Form.Item>

        <Form.Item label="地址" name="address">
          <Input placeholder="请输入" />
        </Form.Item>

        <Form.Item label="类型" name="type">
          <StoreTypeSelect placeholder="请选择" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
