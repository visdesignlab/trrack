import { createProvenanceGraph, PROV_VERSION } from '../src';
import { initializeActionFunctionRegistry } from '../src/action-registry/registry';
import { initializeProvenance } from '../src/provenance/initialize';

describe('Graph Creation', () => {
  const graph = createProvenanceGraph();

  it('Graph is created', () => {
    expect(graph).toBeTruthy();
  });

  describe('Graph is correct', () => {
    it('Graph has correct version', () => {
      expect(graph.PROV_VERSION).toEqual(PROV_VERSION);
    });

    it('Graph has one node', () => {
      expect(Object.values(graph.nodes)).toHaveLength(1);
    });

    const node = Object.values(graph.nodes)[0];
    it('The node is root', () => {
      expect(node.type).toBe('RootNode');
    });

    it('Graph root points to actual root', () => {
      expect(graph.root).toEqual(node.id);
    });

    it('Graph current is set to root', () => {
      expect(graph.current).toEqual(node.id);
    });
  });
});

describe('Graph Traverser', () => {
  const afr = initializeActionFunctionRegistry();

  afr.register('hello', async (name: string) => `Hello, World! from ${name}`);

  const provenance = initializeProvenance(afr);
  provenance.addNewNode('hello', 'Add 10');
  // provenance.addNewNode('World', 'Add 101');
  // provenance.addNewNode('Add 102');
  // provenance.addNewNode('Add 103');

  provenance.undo();
  provenance.undo();
  provenance.undo();

  // provenance.addNewNode('Add 111');
  // provenance.addNewNode('Add 112');
  // provenance.addNewNode('Add 113');

  provenance.print();
});
