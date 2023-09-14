import { AxiosResponse } from 'axios';

import { makeApiSlice } from './api';

export async function fakeApi(args: { a: number; b: number }): Promise<AxiosResponse<number>> {
  return { data: args.a + args.b } as any;
}

describe('build api slice', () => {
  it('should run saga successfully', () => {
    const slice = makeApiSlice('test', fakeApi);
    const state1 = slice.reducer(undefined, slice.actions.request({ a: 1, b: 2 }));
    expect(state1.loading).toBe(true);
    const state2 = slice.reducer(state1, slice.actions.success({ result: 3 }));
    expect(state2.loading).toBe(false);
  });
});
