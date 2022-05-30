import { trrackableStore } from '../src';

describe('blah', () => {
  it('works', () => {
    const a = trrackableStore.toString();
    console.log({ a });
    expect(a).toBeTruthy();
  });
});
