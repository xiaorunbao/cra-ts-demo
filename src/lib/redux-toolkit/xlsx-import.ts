import { get, isEmpty } from 'lodash';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';

import { readXlsx } from 'src/lib/xlsx';

import { makeSlice } from './slice';

export type ImportError = {
  row: number;
  message: string;
};

export enum ImportStatus {
  INITIAL = 0,
  READY,
  INVALID,
  PROCESSING,
  SUCCESS,
  FAILURE,
}

export type XlsxImportColumn = {
  title?: string;
  dataIndex?: string;
  compute?: (val: any, record: any) => any;
  _required?: boolean;
};

export interface XlsxImportState<DataType> {
  show: boolean;
  status: ImportStatus;
  errors: ImportError[];
  data: DataType[];
  step: number;
  file?: string;
}

function defaultState<DataType>() {
  const state: XlsxImportState<DataType> = {
    show: false,
    status: ImportStatus.INITIAL,
    errors: [],
    data: [],
    step: 0,
    file: '',
  };

  return state;
}

export interface XlsxImportFile extends File {
  uid: string;
  readonly lastModifiedDate: Date;
}

/**
 * 通过 filereader 读取文件
 */
export function readFile(file: XlsxImportFile): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;
      if (data) {
        resolve(data as Buffer);
      } else {
        reject(new Error('read file error, data is empty'));
      }
    };
    reader.onerror = (e) => {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}

export interface ActionImportPrepare {
  payload: {
    file: XlsxImportFile;
    columns: XlsxImportColumn[];
    supplement?: Record<string, any>; // 补充数据
  };
}

export interface ActionWithImportError {
  payload: ImportError;
}

export interface ActionWithImportStatus {
  payload: ImportStatus;
}

export interface XlsxImportOption<DataType, DataTypeInXlsx> {
  validate: (xlsxItem: DataTypeInXlsx, row: number, supplement?: any) => Promise<ImportError[]>; // 校验函数
  transform: (xlsxItem: DataTypeInXlsx, supplement?: any) => Promise<DataType>; // 数据变换
  execUpload: (body: DataType) => Promise<void>; // 执行上传
}

export function makeXlsxImportSlice<DataType, DataTypeInXlsx>(
  path: string,
  option: XlsxImportOption<DataType, DataTypeInXlsx>,
  initState?: XlsxImportState<DataType>
) {
  let defaultInitState = defaultState<DataType>();

  const slice = makeSlice(`@xlsx-import.${path}`, {
    initState: initState || defaultInitState,
    reducers: {
      open: (state) => {
        state.show = true;
      },
      close: (state) => {
        state.show = false;
        state.status = defaultInitState.status;
        state.errors = defaultInitState.errors;
        state.step = defaultInitState.step;
        state.file = defaultInitState.file;
        state.data = [];
      },
      prepare: (state, { payload }: ActionImportPrepare) => {
        state.status = ImportStatus.INITIAL;
        state.errors = [];
        state.step = 0;
        state.file = undefined;
        state.data = [];
      },
      start: (state) => {
        state.step = 0;
        state.status = ImportStatus.PROCESSING;
      },
      setFile: (state, { payload }: { payload: string }) => {
        state.file = payload;
      },
      addError: (state, { payload }: ActionWithImportError) => {
        state.errors.push(payload);
      },
      setStatus: (state, { payload }: ActionWithImportStatus) => {
        state.status = payload;
      },
      setData: (state, { payload }: { payload: DataType[] }) => {
        state.data = payload as any;
      },
      process: (state) => {
        state.step += 1;
        if (state.step >= state.data.length) {
          state.status = ImportStatus.SUCCESS;
        }
      },
    },
  });

  function* prepareSaga(action: ActionImportPrepare): any {
    const { columns, file, supplement } = action.payload;

    yield put(slice.actions.setFile(file.name));
    const fileData = yield call(readFile, file);

    const xlsxData: DataTypeInXlsx[] = readXlsx({
      columns: columns as any,
      fileData,
    });

    if (xlsxData.length === 0) {
      yield put(slice.actions.addError({ row: 1, message: '没有数据' }));
    }

    const requiredCols = columns.filter((c) => c._required);

    for (let i = 0; i < xlsxData.length; i++) {
      const row = i + 2;
      const item = xlsxData[i];

      // 校验required
      for (const c of requiredCols) {
        if (!get(item, c.dataIndex as string)) {
          yield put(slice.actions.addError({ row: i + 2, message: `${c.title}不能为空` }));
        }
      }

      const errs = yield call(option.validate, item, row, supplement);

      if (errs.length > 0) {
        for (const err of errs) {
          yield put(slice.actions.addError(err));
        }
      }
    }

    const data: DataType[] = [];

    for (let i = 0; i < xlsxData.length; i++) {
      data[i] = yield call(option.transform, xlsxData[i], supplement);
    }

    const { errors } = yield select(slice.getSelector());

    if (isEmpty(errors)) {
      yield put(slice.actions.setStatus(ImportStatus.READY));
      yield put(slice.actions.setData(data));
    } else {
      yield put(slice.actions.setStatus(ImportStatus.INVALID));
    }
  }

  function* startSaga(): any {
    const { data } = yield select(slice.getSelector());

    for (let i = 0; i < data.length; i++) {
      const body = data[i];
      try {
        yield call(option.execUpload, body);
        yield put(slice.actions.process());
      } catch (error) {
        yield put(slice.actions.setStatus(ImportStatus.FAILURE));
        yield put(slice.actions.addError({ row: i + 2, message: get(error, 'message', '上传失败') }));
        break;
      }
    }
  }

  slice.saga = function* () {
    yield all([takeLatest(slice.actions.prepare, prepareSaga), takeLatest(slice.actions.start, startSaga)]);
  };

  return slice;
}
