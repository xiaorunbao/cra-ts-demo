import { PayloadAction } from './action';
import { makeSlice } from './slice';

describe('slice', () => {
  it('should build slice with right action and reducer', () => {
    const slice = makeSlice('www', {
      initState: {
        a: [1, 2],
        b: 'something',
        c: { a: 1, b: 2 },
        d: { e: 1, f: 2 },
      },
      reducers: {
        sub: (state) => {
          state.c.b--;
        },
        push: (state, { payload }: PayloadAction<number>) => {
          state.a.push(payload);
        },
        setWord: (state, { payload }: PayloadAction<string>) => {
          state.b = payload;
        },
        test: (state, { payload }) => {
          state.a = payload;
        },
      },
      caseReducers: {
        '@api/test': (state, { payload }: { payload: { a: number } }) => {
          state.c.a = payload.a;
        },
      },
      extraReducer: (state, action) => {
        switch (action.type) {
          case 'xxx':
            return { ...state, d: action.payload };
          default:
            return state;
        }
      },
    });
    const state1 = slice.reducer(undefined, slice.actions.sub());
    const state2 = slice.reducer(undefined, slice.actions.push(8));
    const state3 = slice.reducer(undefined, slice.actions.setWord('hello world!'));
    const state4 = slice.reducer(undefined, { type: 'xxx', payload: 10 });
    const state5 = slice.reducer(undefined, { type: '@api/test', payload: { a: 100 } });

    expect(state1.c.b).toBe(1);
    expect(state2.a).toContain(8);
    expect(state3.b).toBe('hello world!');
    expect(state4.d).toBe(10);
    expect(state5.c.a).toBe(100);
    expect(slice.actions.setWord.type).toBe('www/SET_WORD');
  });

  it('should build slice with prepare', () => {
    const slice = makeSlice('www', {
      initState: {
        a: [1, 2],
      },
      reducers: {
        test: {
          reducer: (state, action: PayloadAction<number[]>) => {
            state.a = action.payload;
          },
          prepare(v: number) {
            return { payload: [v] };
          },
        },
      },
    });
    const state1 = slice.reducer(undefined, slice.actions.test(8));

    expect(state1.a).toEqual([8]);
  });
});
