import { get, set, cloneDeep, isNil } from 'lodash';
import { all, put, takeLatest } from 'redux-saga/effects';

import { writeXlsx } from 'src/lib/xlsx';

import { makeSlice } from './slice';

export interface XlsxExportState {
  show: boolean; // 是否显示导出modal
  exporting: boolean; // 导出中
  tip: string; // 导出提示
  success: boolean; // 是否成功
}

export type XlsxExportColumn = {
  title?: string;
  dataIndex?: string;
  key?: string;
  _width?: number;
  compute?: (val: any, record: any) => any;
};

const defaultInitState: XlsxExportState = {
  show: false,
  exporting: false,
  tip: '',
  success: true,
};

export type ExportProcessAction = {
  payload: {
    columns: XlsxExportColumn[]; // 列描述
    rows: any[]; // 行数据
    tip?: string;
    filename: string; // 导出文件名
  };
};

export function makeXlsxExportSlice(path: string, initState?: XlsxExportState) {
  const slice = makeSlice(`@xlsx-export.${path}`, {
    initState: initState || defaultInitState,
    reducers: {
      open: (state) => {
        state.show = true;
        state.tip = '';
      },
      close: (state) => {
        state.show = false;
      },
      start: (state, { payload = '正在准备数据...' }: { payload: string | undefined }) => {
        state.tip = payload;
        state.exporting = true;
        state.success = true;
      },
      process: (state, { payload }: ExportProcessAction) => {
        state.exporting = true;
        state.tip = payload.tip || '正在导出...';
      },
      finish: (state, { payload = '导出完成' }: { payload: string | undefined }) => {
        state.tip = payload;
        state.exporting = false;
      },
      error: (state, { payload = '导出失败' }: { payload: string | undefined }) => {
        state.success = false;
        state.exporting = false;
        state.tip = payload;
      },
    },
  });

  function* exportProcessSaga(action: ExportProcessAction): any {
    try {
      const { payload } = action;
      let { rows, columns, filename } = cloneDeep(payload);

      columns = columns.filter((item) => !isNil(item.dataIndex));

      // 根据columns 转换
      for (const row of rows) {
        for (const col of columns) {
          if (typeof col.compute === 'function' && typeof col.dataIndex === 'string') {
            const val = get(row, col.dataIndex);
            const result = isNil(val) ? '' : col.compute(val, row);
            set(row, col.dataIndex, result);
          }
        }
      }

      writeXlsx({
        rows,
        columns: columns as any[],
        distFile: filename,
      });
      yield put(slice.actions.finish());
      yield put(slice.actions.close());
    } catch (error) {
      console.error(error);
      yield put(slice.actions.error());
    }
  }

  slice.saga = function* () {
    yield all([takeLatest(slice.actions.process, exportProcessSaga)]);
  };

  return slice;
}
