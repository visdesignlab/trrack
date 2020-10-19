import { isStateNode } from '../src';
import { initialState, setupProvenanceAndAction } from './helper';

describe('provenance graph has correct shape', () => {
  const { provenance } = setupProvenanceAndAction(initialState);

  it('provenance graph should not be null', () => expect(provenance.graph).not.toBeNull());

  it('provenance graph should have root', () => expect(provenance.graph.root).not.toBeNull());

  it('provenance graph should have current', () => expect(provenance.graph.current).not.toBeNull());

  it('provenance graph should have nodes', () => expect(provenance.graph.nodes).not.toBeNull());
});

describe('provenance graph has correct values', () => {
  const { provenance } = setupProvenanceAndAction(initialState);

  it('should have one node', () => expect(Object.keys(provenance.graph.nodes)).toHaveLength(1));

  it('should have a root node', () => expect(provenance.root).not.toBeNull());

  it('root and current node should be same', () => {
    const { current, root } = provenance;
    expect(current.id).toEqual(root.id);
  });

  it('Current node is not a state node', () => expect(isStateNode(provenance.current)).toBeFalsy());
});
