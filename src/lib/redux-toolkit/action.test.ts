import { makeAction } from './action';

describe('make action', () => {
  it('should return action creator without key and payload', () => {
    const actionCreator = makeAction('type');
    const action = actionCreator();
    expect(action).toEqual({ type: 'type' });
  });

  it('should return action creator with key and without payload', () => {
    const actionCreator = makeAction('type', 'key');
    const action = actionCreator();
    expect(action).toEqual({ type: 'type', key: 'key' });
  });

  it('should return action creator with key and payload', () => {
    const actionCreator = makeAction('type', 'key', (a: number, b: string) => ({ payload: a }));
    const action = actionCreator(1, 'nothing');
    expect(action).toEqual({ type: 'type', key: 'key', payload: 1 });
  });

  it('should return action creator without key and with payload', () => {
    const actionCreator = makeAction('type', (a: number) => ({ payload: a }));
    const action = actionCreator(1);
    expect(action).toEqual({ type: 'type', payload: 1 });
  });
});
