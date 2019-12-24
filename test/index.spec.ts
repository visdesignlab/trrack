import { initProvenance } from '../src';

describe('Hello', () => {
  it('says hello', () => {
    interface State {
      count: number;
    }

    const state: State = {
      count: 0
    };

    const provenance = initProvenance(state);
    console.log(provenance);

    expect(provenance).toBeDefined();
  });
});
