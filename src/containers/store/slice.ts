import { all, put, takeLatest } from 'redux-saga/effects';

import { makeApiSlice, makeSlice } from 'src/lib/redux-toolkit';
import { petSchema, petstore } from 'src/service';

export interface StoreState {
  editMode?: 'create' | 'dedit';
}

export const initState: StoreState = {
  editMode: undefined,
};

export const storeSlice = makeSlice('@pet-store', {
  initState,
  reducers: {
    setEditMode(state, action) {
      state.editMode = action.payload;
    },
  },
});

export const listStoreSlice = makeApiSlice('listPetStore', petstore.listStore, {
  schema: [petSchema],
});

export const createStoreSlice = makeApiSlice('createPetStore', petstore.createStore, {
  schema: petSchema,
});

storeSlice.saga = function* () {
  yield all([
    takeLatest([createStoreSlice.actions.success], function* () {
      // 创建成功后, 关闭编辑模式
      yield put(storeSlice.actions.setEditMode(undefined));
    }),
  ]);
};
