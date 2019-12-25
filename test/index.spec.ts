import { initProvenance, ProvenanceGraph } from '../src';
describe('Hello', () => {
  it('okay', () => {
    const prove = initProvenance({});
    const graph: ProvenanceGraph<{}> = prove.graph();
    expect(true).toBeTruthy();
  });
});
