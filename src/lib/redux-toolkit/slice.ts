import { useEffect, useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';
import { Reducer } from 'redux';
import { Saga } from 'redux-saga';

import {
  PrepareAction,
  _ActionCreatorWithPreparedPayload,
  PayloadActionCreator,
  ActionCreatorWithoutPayload,
  makeAction,
  buildType,
  PayloadAction,
} from './action';
import { CaseReducer, composed, makeKeyReducer, makeReducer } from './reducer';
import { Selector, makeSelector } from './selector';
import { DynamicStore } from './store';

export type CaseReducerWithPrepare<State, Action extends PayloadAction> = {
  reducer: CaseReducer<State, Action>;
  prepare: PrepareAction<Action['payload']>;
};

export type SliceCaseReducers<State> = {
  [K: string]:
    | CaseReducer<State, PayloadAction<any>>
    | CaseReducerWithPrepare<State, PayloadAction<any, string, any, any>>;
};

type ActionCreatorForCaseReducer<CR> = CR extends (state: any, action: infer Action) => any
  ? Action extends { payload: infer P }
    ? PayloadActionCreator<P>
    : ActionCreatorWithoutPayload
  : ActionCreatorWithoutPayload;

type ActionCreatorForCaseReducerWithPrepare<CR extends { prepare: any }> = _ActionCreatorWithPreparedPayload<
  CR['prepare'],
  string
>;

export type CaseReducerActions<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends { prepare: any }
    ? ActionCreatorForCaseReducerWithPrepare<CaseReducers[Type]>
    : ActionCreatorForCaseReducer<CaseReducers[Type]>;
};

type SliceDefinedCaseReducers<CaseReducers extends SliceCaseReducers<any>> = {
  [Type in keyof CaseReducers]: CaseReducers[Type] extends {
    reducer: infer Reducer;
  }
    ? Reducer
    : CaseReducers[Type];
};

/**
 * Used on a SliceCaseReducers object.
 * Ensures that if a CaseReducer is a `CaseReducerWithPrepare`, that
 * the `reducer` and the `prepare` function use the same type of `payload`.
 *
 * Might do additional such checks in the future.
 *
 * This type is only ever useful if you want to write your own wrapper around
 * `makeSlice`. Please don't use it otherwise!
 */
export type ValidateSliceCaseReducers<S, ACR extends SliceCaseReducers<S>> = ACR & {
  [T in keyof ACR]: ACR[T] extends {
    reducer(s: S, action?: infer A): any;
  }
    ? {
        prepare(...a: never[]): Omit<A, 'type'>;
      }
    : {};
};

/**
 * The return value of `makeSlice`
 *
 * @public
 */
export interface Slice<State = any, CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>> {
  /**
   * Judge if the given action is a slice action.
   */
  isAction: (action: PayloadAction<unknown>) => boolean;

  /**
   * Is a key slice
   */
  isKeySlice: () => boolean;

  /**
   * The slice key.
   */
  path: string;

  /**
   * The slice's reducer.
   */
  reducer: Reducer<State>;

  /**
   * Action creators for the types of actions that are handled by the slice
   * reducer.
   */
  actions: CaseReducerActions<CaseReducers>;

  /**
   * The individual case reducer functions that were passed in the `reducers` parameter.
   * This enables reuse and testing if they were defined inline when calling `makeSlice`.
   */
  caseReducers: SliceDefinedCaseReducers<CaseReducers>;

  /**
   * Selector for this sub state
   */
  getSelector: () => Selector<any, State>;

  /**
   * Saga for this slice
   */
  saga?: Saga<any[]>;

  /**
   * Provides access to the initial state value given to the slice.
   * If a lazy state initializer was provided, it will be called and a fresh value returned.
   */
  getInitState: () => State;
}

/**
 * Recipe for `makeSlice()`.
 */
export interface Recipe<State = any, CR extends SliceCaseReducers<State> = SliceCaseReducers<State>> {
  /**
   * The initial state that should be used when the reducer is called the first time. This may also be a "lazy initializer" function, which should return an initial state value when called. This will be used whenever the reducer is called with `undefined` as its state value, and is primarily useful for cases like reading initial state from `localStorage`.
   */
  initState: State;

  /**
   * A mapping from action types to action-type-specific *case reducer*
   * functions. For every action type, a matching action creator will be
   * generated using `createAction()`.
   */
  reducers: ValidateSliceCaseReducers<State, CR>;

  /**
   * 除了不产生 action 之外，其它同 reducers
   */
  caseReducers?: SliceCaseReducers<State>;

  /**
   * 额外的自定义 Reducer，用于更新 state 的值
   */
  extraReducer?: CaseReducer<State, PayloadAction<any>>;

  /**
   * slice devied by key
   */
  reducebyKey?: boolean;

  /**
   *
   */
  namePrefix?: string;
}

export function makeSlice<State, SCRs extends SliceCaseReducers<State> = SliceCaseReducers<State>>(
  path: string,
  recipe: Recipe<State, SCRs>
): Slice<State, SCRs> {
  const { initState, reducers, caseReducers, extraReducer, reducebyKey, namePrefix } = recipe;
  const sliceCaseReducersByName: Record<string, CaseReducer> = {};
  const sliceCaseReducersByType: Record<string, CaseReducer> = {};
  const actionCreators: Record<string, Function> = {};

  Object.entries(reducers).forEach(([name, maybeReducerWithPrepare]) => {
    const type = buildType(path, name, namePrefix);
    let caseReducer: CaseReducer<State, any>;
    let prepareCallback: PrepareAction<any> | undefined;

    if ('reducer' in maybeReducerWithPrepare) {
      caseReducer = maybeReducerWithPrepare.reducer;
      prepareCallback = maybeReducerWithPrepare.prepare;
    } else {
      caseReducer = maybeReducerWithPrepare;
    }

    sliceCaseReducersByName[name] = caseReducer;
    sliceCaseReducersByType[type] = caseReducer;
    actionCreators[name] = prepareCallback ? makeAction(type, prepareCallback) : makeAction(type);
  });

  const reducersMap = { ...sliceCaseReducersByType, ...caseReducers };
  const isAction = (action: any): action is PayloadAction<any> => action.type in reducersMap;
  let reducer = makeReducer(initState, reducersMap as any);
  if (reducebyKey) {
    reducer = makeKeyReducer(isAction, reducer) as any;
  }
  if (extraReducer) {
    reducer = composed(extraReducer as any, reducer as any) as any;
  }

  const isKeySlice = () => reducebyKey === true;

  return {
    isKeySlice,
    isAction,
    path,
    reducer,
    actions: actionCreators as any,
    caseReducers: sliceCaseReducersByName as any,
    getSelector: () => makeSelector<State>(path, initState),
    getInitState: () => initState,
  };
}

type UseSliceOptions = {
  key?: string;
  removeOnLeave?: boolean;
};

/**
 * Slice hook
 *
 * @param slice 生成的切片
 * @param options 配置
 * @returns [sliceState, actions]
 */
export function useSlice<State, SCRs extends SliceCaseReducers<State> = SliceCaseReducers<State>>(
  slice: Slice<State, SCRs>,
  options: UseSliceOptions = {}
): [State, CaseReducerActions<SCRs>] {
  const store = useStore() as DynamicStore;
  const { path, actions, reducer, getSelector, saga } = slice;
  const { removeOnLeave = false, key } = options;

  useEffect(() => {
    store.inject(path, reducer, saga);

    return () => {
      if (removeOnLeave) {
        store.remove(path);
      }
    };
  }, []); // eslint-disable-line

  const selector = useMemo(getSelector, []);
  const sliceState = useSelector((state) => selector(state, key));
  return [sliceState, actions];
}
