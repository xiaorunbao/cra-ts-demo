import { get, set, isPlainObject } from 'lodash';
import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
  ReducersMapObject,
  Action,
  Reducer,
  Middleware,
  Store,
} from 'redux';
import createSagaMiddleware, { Saga, Task } from 'redux-saga';

import { assert } from 'src/lib/lang/assert';

import { entitiesReducer } from './entity';
import { nestedCombineReducers } from './nested-combine-reducers';
import { clean } from './utils';

export interface DynamicStore extends Store {
  inject: (key: string, reducer: Reducer, saga?: Saga) => void;
  remove: (key: string) => void;
  runSaga: (saga: Saga, ...args: Parameters<Saga>) => Task;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export function createReducerManager(initialReducers: ReducersMapObject) {
  // Create an object which maps keys to reducers
  const reducers = { ...initialReducers, entities: entitiesReducer };

  // Create the initial combinedReducer
  let combinedReducer = nestedCombineReducers(reducers);

  // An array which is used to delete state keys when reducers are removed
  let keysToRemove: string[] = [];

  return {
    getReducerMap: () => reducers,

    // The root reducer function exposed by this object
    // This will be passed to the store
    reducer: (oState: any, action: Action) => {
      // If any reducers have been removed, clean up their state first
      let state = oState;
      if (keysToRemove.length > 0) {
        state = { ...state }; // TODO: 检查此处是否需要返回新的 state 对象，理论上这个地方的变化是不需要让 store 知道的
        for (const key of keysToRemove) {
          clean(state, key);
        }
        keysToRemove = [];
      }

      // Delegate to the combined reducer
      return combinedReducer(state, action);
    },

    // check if the reducer is already registered
    has: (key: string) => {
      return !!get(reducers, key);
    },

    // Adds a new reducer with the specified key
    add: (key: string, reducer: Reducer) => {
      // Add the reducer to the reducer mapping
      set(reducers, key, reducer);

      // Generate a new combined reducer
      combinedReducer = nestedCombineReducers(reducers);
    },

    // Removes a reducer with the specified key
    remove: (key: string) => {
      // Remove it from the reducer mapping
      clean(reducers, key);

      // Add the key to the list of keys to clean up
      keysToRemove.push(key);

      // Generate a new combined reducer
      combinedReducer = nestedCombineReducers(reducers);
    },
  };
}

export function configureStore(rootReducers = {}, ...middlewares: Middleware<any, any, any>[]) {
  assert(
    isPlainObject(rootReducers),
    '"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers'
  );
  assert(
    middlewares.every((item) => typeof item === 'function'),
    '"middleware" must be a function that can be passed to applyMiddleware'
  );

  const reducerManager = createReducerManager(rootReducers);
  const sagaMiddleware = createSagaMiddleware();
  const sagaTasks = new Map<string, Task>();

  /* @ts-ignore */
  const composeEnhancers = IS_PRODUCTION ? compose : window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  /* @ts-ignore */

  const store: DynamicStore = createStore(
    reducerManager.reducer,
    composeEnhancers(applyMiddleware(sagaMiddleware, ...middlewares))
  );

  /** for code splitting */

  store.inject = (key, reducer, saga?) => {
    if (!reducerManager.has(key)) {
      if (reducer) reducerManager.add(key, reducer);
      if (saga) {
        const task = sagaMiddleware.run(saga);
        sagaTasks.set(key, task);
      }
    }
  };
  store.remove = (key) => {
    if (reducerManager.has(key)) {
      reducerManager.remove(key);
      const task = sagaTasks.get(key);
      task?.cancel();
      sagaTasks.delete(key);
    }
  };

  store.runSaga = sagaMiddleware.run;

  return store;
}
