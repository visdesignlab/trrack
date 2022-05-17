import { createProvenanceGraph, initializeTrrack, PROV_VERSION } from '../src';
import { initializeActionFunctionRegistryTracker } from '../src/action/registry/tracker';
import { Action } from '../src/action/types';

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
  const afrTracker = initializeActionFunctionRegistryTracker();

  let a = 0;

  afrTracker.register(
    'add_to_a',
    (toAdd: number) => (a += toAdd),
    (toRemove: number) => (a -= toRemove)
  );

  const provenance = initializeTrrack(afrTracker);

  function getAddAction(toAdd: number): Action {
    return {
      registry_name: 'add_to_a',
      label: `Adding ${toAdd}`,
      do: {
        args: [toAdd],
      },
      undo: {
        args: [toAdd],
      },
    };
  }

  provenance.applyAction(getAddAction(1));
  provenance.applyAction(getAddAction(31));
  provenance.applyAction(getAddAction(2));

  provenance.undo();
  provenance.undo();
  provenance.undo();

  provenance.print();
  console.log({ a });
});
