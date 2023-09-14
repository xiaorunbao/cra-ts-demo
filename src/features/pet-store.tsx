import { Select, SelectProps } from 'antd';

import { StoreType } from 'src/sdk/petstore';

export const StoreTypeI18N = {
  [StoreType.PET_STORE]: '宠物店',
  [StoreType.DOG_STORE]: '狗店',
  [StoreType.CAT_STORE]: '猫店',
};

export const StoreTypeSelect = (props: SelectProps) => {
  return (
    <Select {...props}>
      {Object.values(StoreType).map((type) => (
        <Select.Option key={type} value={type}>
          {StoreTypeI18N[type]}
        </Select.Option>
      ))}
    </Select>
  );
};
