import { createProvenanceGraph } from '../../src/Provenance/ProvenanceGraphFunction';

describe('Creating Provenance Graph function', () => {
  interface State {
    count: number;
  }

  const initialState: State = {
    count: 0
  };

  const graph = createProvenanceGraph(initialState);

  test('graph should be a valid provenance graph', () => {
    expect(graph).toHaveProperty('nodes');
    expect(graph).toHaveProperty('current');
    expect(graph).toHaveProperty('root');
  });

  test('initalState should match root', () => {
    const state = graph.nodes[graph.root].state;
    expect(state).toMatchObject(initialState);
  });

  test('root state should match current state', () => {
    const currentState = graph.current;
    const rootState = graph.root;
    expect(currentState).toEqual(rootState);
  });

  test('nodes list is not empty', () => {
    expect(Object.keys(graph.nodes).length).toEqual(1);
  });

  test('node in nodes list must be equal to root node', () => {
    const node = graph.nodes[Object.keys(graph.nodes)[0]].id;
    expect(node).toEqual(graph.root);
  });

  test(' node in nodes list must be equal to current node', () => {
    const node = graph.nodes[Object.keys(graph.nodes)[0]].id;
    expect(node).toEqual(graph.current);
  });
});
