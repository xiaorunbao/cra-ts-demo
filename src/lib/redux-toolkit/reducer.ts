import { Draft, produce } from 'immer';
import { get, set } from 'lodash';
import type { AnyAction, Action, Reducer } from 'redux';

/**
 * Defines a mapping from action types to corresponding action object shapes.
 */
type Actions<T extends keyof any = string> = Record<T, Action>;

/**
 * An *case reducer* is a reducer function for a specific action type. Case
 * reducers can be composed to full reducers using `makeReducer()`.
 *
 * Unlike a normal Redux reducer, a case reducer is never called with an
 * `undefined` state to determine the initial state. Instead, the initial
 * state is explicitly specified as an argument to `makeReducer()`.
 *
 * In addition, a case reducer can choose to mutate the passed-in `state`
 * value directly instead of returning a new state. This does not actually
 * cause the store state to be mutated directly; instead, thanks to
 * [immer](https://github.com/mweststrate/immer), the mutations are
 * translated to copy operations that result in a new state.
 *
 */
export type CaseReducer<S = any, A extends Action = AnyAction> = (state: Draft<S>, action: A) => S | void | Draft<S>;

/**
 * A mapping from action types to case reducers for `makeReducer()`.
 */
export type CaseReducers<S, AS extends Actions> = {
  [T in keyof AS]: AS[T] extends Action ? CaseReducer<S, AS[T]> : void;
};

/**
 * 组合 reducer
 *
 * @param f reducer 1
 * @param g reducer 2
 * @returns 一个新的 reducer
 */
export const composed =
  <S>(f: Reducer<S>, g: Reducer<S>) =>
  (state: S, action: Action): S =>
    f(g(state, action), action);

/**
 * A utility function that allows defining a reducer as a mapping from action
 * type to *case reducer* functions that handle these action types. The
 * reducer's initial state is passed as the first argument.
 *
 * The body of every case reducer is implicitly wrapped with a call to
 * `produce()` from the [immer](https://github.com/mweststrate/immer) library.
 * This means that rather than returning a new state object, you can also
 * mutate the passed-in state object directly; these mutations will then be
 * automatically and efficiently translated into copies, giving you both
 * convenience and immutability.
 * 
 * @overloadSummary
 * This overload accepts an object where the keys are string action types, and the values
 * are case reducer functions to handle those action types.
 *
 * @param iitState - `State | (() => State)`: The initial state that should be used when the reducer is called the first time. This may also be a "lazy initializer" function, which should return an initial state value when called. This will be used whenever the reducer is called with `undefined` as its state value, and is primarily useful for cases like reading initial state from `localStorage`.
 * @param reducersMap - An object mapping from action types to _case reducers_, each of which handles one specific action type.
 *
 * @example
```js
const counterReducer = makeReducer(0, {
  increment: (state, action) => state + action.payload,
  decrement: (state, action) => state - action.payload
})
// Alternately, use a "lazy initializer" to provide the initial state
// (works with either form of makeReducer)
const initState = () => 0
const counterReducer = makeReducer(initState, {
  increment: (state, action) => state + action.payload,
  decrement: (state, action) => state - action.payload
})
```
 
 * Action creators that were generated using [`makeAction`](./makeAction) may be used directly as the keys here, using computed property syntax:
```js
const increment = makeAction('increment')
const decrement = makeAction('decrement')
const counterReducer = makeReducer(0, {
  [increment]: (state, action) => state + action.payload,
  [decrement.type]: (state, action) => state - action.payload
})
```
**/

export function makeReducer<S, CR extends CaseReducers<S, any> = CaseReducers<S, any>>(
  initState: S,
  reducersMap: CR
): Reducer<S> {
  const reducer = produce((draft: Draft<S>, action: Action) => {
    const caseReducer = reducersMap[action.type];
    if (caseReducer) {
      caseReducer(draft, action);
    }
  }, initState);
  return reducer;
}

export const makeKeyReducer =
  (is: (action: AnyAction) => boolean, r: Reducer<any>) =>
  (state = {}, action: AnyAction) => {
    const key = get(action, 'key');
    if (!is(action) || !key) return state;

    const keyState = r(get(state, key), action);
    return produce(state, (draftState) => {
      set(draftState as object, key, keyState);
    });
  };
