import { schema } from 'normalizr';

import { makeEntitiesSelector } from './entity';

export async function fakeApi(args: { a: number; b: number }) {
  return args.a + args.b;
}

describe('entity', () => {
  it('should make entity selector', () => {
    const carSchema = new schema.Entity('cars');
    const carSelector = makeEntitiesSelector(carSchema);
    const carListSelector = makeEntitiesSelector([carSchema]);
    const state = {
      entities: {
        cars: {
          '1': {
            id: '1',
            name: 'ford',
          },
          '2': {
            id: '2',
            name: 'bmw',
          },
        },
      },
    };
    const result1 = carSelector(state, '1');
    expect(result1.name).toEqual('ford');
    const result2 = carSelector(state, '3');
    expect(result2).toBeUndefined();
    const result3 = carListSelector(state, ['1', '3']);
    expect(result3[0].name).toBe('ford');
    expect(result3[1]).toBe(undefined);
  });
});
