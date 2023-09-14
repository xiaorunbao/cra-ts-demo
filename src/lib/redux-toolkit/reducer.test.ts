import { get } from 'lodash';

import { makeReducer, makeKeyReducer } from './reducer';

describe('build reducer', () => {
  it('should return reducer correct', () => {
    const initState = {
      count: 0,
    };

    const reducer = makeReducer(initState, {
      increment: (state, action) => {
        state.count += action.payload;
      },
    });
    const nextState1 = reducer(initState, { type: 'increment', payload: 1 });
    expect(nextState1.count).toBe(1);
  });
  it('should return key reducer correct', () => {
    const initState = {
      count: 0,
    };
    const r = makeReducer(initState, {
      increment: (state, action) => {
        state.count += action.payload;
      },
    });
    const reducer = makeKeyReducer(() => true, r);
    const nextState1 = reducer(undefined, { type: 'increment', payload: 1, key: 'sub.a' });
    // @ts-ignore
    expect(get(nextState1, 'sub.a').count).toBe(1);
    const nextState2 = reducer(nextState1, { type: 'increment', payload: 1, key: 'sub.a' });
    // @ts-ignore
    expect(get(nextState2, 'sub.a').count).toBe(2);
    expect(nextState1).not.toBe(nextState2);
  });
});
