import { AxiosResponse } from 'axios';
import { Draft } from 'immer';
import { denormalize, normalize, Schema } from 'normalizr';
import { Action } from 'redux';
import { all, call, put, select } from 'redux-saga/effects';
import { createSelector } from 'reselect';

import { assert } from 'src/lib/lang/assert';

import { isAction, PayloadAction, PrepareAction } from './action';
import { entitiesStateSelector } from './entity';
import { takeLeadingPerKey } from './saga';
import { Selector } from './selector';
import { makeSlice } from './slice';

const PREFIX = '@api';

export interface ActionWithPayload<T> extends Action<T> {
  payload?: any;
  meta?: any;
  key?: string;
}

export interface ApiState<T = any> {
  args: any;
  error?: any;
  failureAt?: number;
  fetched?: boolean;
  loading: boolean;
  requestAt?: number;
  result?: T;
  successAt?: number;
  total?: number;
}

type ApiSliceOptions = {
  schema?: Schema;
  prepare?: PrepareAction<any>;
  reducebyKey?: boolean;
};

export const isApi = isAction(new RegExp(`^${PREFIX}/.*$`));
export const isRequest = isAction(new RegExp(`^${PREFIX}(.*)/REQUEST`));
export const isSuccess = isAction(new RegExp(`^${PREFIX}(.*)/SUCCESS`));
export const isFailure = isAction(new RegExp(`^${PREFIX}(.*)/FAILURE`));
export const isRefresh = isAction(new RegExp(`^${PREFIX}(.*)/REFRESH`));

export const makeApiSelector = <T, S = any>(selector: Selector<S, ApiState<T>>, schema: Schema) =>
  createSelector([selector, entitiesStateSelector], (subState: ApiState<T>, entities) => {
    const result = denormalize(subState.result, schema, entities);
    return { ...subState, result };
  });

export function makeApiSlice<Result, Args>(
  path: string,
  endpoint: (args: Args) => Promise<AxiosResponse<Result>>,
  options: ApiSliceOptions = {}
) {
  assert(typeof endpoint === 'function', `api action ${path}.${endpoint.name} should has endpoint.`);
  const { schema, reducebyKey, prepare = (args: Args, meta?) => ({ payload: args, meta }) } = options;

  const initState: ApiState<Result> = {
    args: {},
    fetched: false,
    loading: false,
  };

  const slice = makeSlice(`${PREFIX}.${path}`, {
    initState,
    reducebyKey,
    namePrefix: `${endpoint.name}_`,
    reducers: {
      request: {
        reducer: (state: Draft<ApiState>, action: PayloadAction<Args>) => {
          state.loading = true;
          state.requestAt = Date.now();
          state.args = action.payload;
        },
        prepare,
      },
      success(state, action: { payload: { result: Result; total?: number } }) {
        state.loading = false;
        state.error = undefined;
        state.successAt = Date.now();
        state.total = action.payload.total;
        state.result = action.payload.result as Draft<Result>;
        state.fetched = true;
      },
      failure(state, { payload }) {
        state.loading = false;
        state.error = payload;
        state.failureAt = Date.now();
        state.fetched = true;
      },
      refresh(state) {
        state.loading = true;
        state.requestAt = Date.now();
      },
      invalidate(state) {
        state.successAt = undefined;
        state.failureAt = undefined;
        state.fetched = false;
      },
    },
  });
  if (schema) {
    const selector = slice.getSelector();
    slice.getSelector = () => makeApiSelector(selector, schema);
  }

  function* callAPI(action: ActionWithPayload<string>): any {
    const { payload: args, meta, key } = action;

    try {
      const response: AxiosResponse<Result> = yield call(endpoint, args);
      const result: Result = response.data;
      const data: { result: Result; total?: number } = schema ? normalize(result, schema) : { result };
      const total = Number(response.headers['x-total-count']);
      if (!isNaN(total)) data.total = total;

      const successAction = slice.actions.success(data);
      yield put({ ...successAction, meta, key });
    } catch (err) {
      console.error(err);
      const failureAction = slice.actions.failure(err);
      yield put({ ...failureAction, meta, key });
    }
  }

  function* refresh(): any {
    const selector = slice.getSelector();
    const payload = yield select((state) => selector(state, 'args'));
    yield callAPI(slice.actions.request(payload));
  }

  function* watchApi() {
    yield all([
      takeLeadingPerKey(slice.actions.refresh.type, refresh),
      takeLeadingPerKey(slice.actions.request.type, callAPI),
    ]);
  }

  slice.saga = watchApi;
  return slice;
}
