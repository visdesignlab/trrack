const applyChange = require('deep-diff').applyChange;

import { ProvenanceGraph } from '../Interfaces/ProvenanceGraph';
import {
  RootNode,
  NodeID,
  NodeMetadata,
  Artifacts,
  StateNode,
  DiffNode,
  Diff,
  isStateNode,
  isChildNode,
  isDiffNode,
  Extra
} from '../Interfaces/NodeInterfaces';
import generateUUID from '../Utils/generateUUID';
import generateTimeStamp from '../Utils/generateTimeStamp';
import deepCopy from '../Utils/DeepCopy';
import { ActionFunction } from '../Interfaces/Provenance';
import deepDiff from '../Utils/DeepDiff';

export function createProvenanceGraph<T, S, A>(state: T): ProvenanceGraph<T, S, A> {
  const root: RootNode<T, S> = {
    id: generateUUID(),
    label: 'Root',
    metadata: {
      createdOn: generateTimeStamp(),
      type: 'Root'
    },
    children: [],
    state: state,
    getState: () => {
      return state;
    },
    ephemeral: false
  };

  const graph: ProvenanceGraph<T, S, A> = {
    nodes: {
      [root.id]: root
    },
    root: root.id,
    current: root.id
  };

  return graph;
}

export function goToNode<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  id: NodeID
): ProvenanceGraph<T, S, A> {
  const newGraph = deepCopy(graph);

  const newCurrentNode = graph.nodes[id];

  if (!newCurrentNode) {
    throw new Error('No such node exists');
  }

  newGraph.current = newCurrentNode.id;

  return newGraph;
}

export function importState<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  initalState: T,
  importedState: T
) {
  const newGraph = deepCopy(graph);

  const createNewStateNode = (parent: NodeID, state: T, diffs: Diff[]): StateNode<T, S, A> => ({
    id: generateUUID(),
    label: 'Imported state',
    metadata: {
      createdOn: generateTimeStamp()
    },
    artifacts: {
      extra: [],
      diffs
    },
    parent: parent,
    children: [],
    state: state,
    getState: () => {
      return state;
    },
    ephemeral: false
  });

  let diffs = deepDiff(initalState, importedState);

  if (diffs === undefined) {
    diffs = [];
  }

  const newNode = createNewStateNode(graph.current, importedState, diffs);

  newGraph.nodes[newNode.id] = newNode;
  newGraph.nodes[newGraph.current].children.push(newNode.id);
  newGraph.current = newNode.id;

  return newGraph;
}

export function addExtraToNodeArtifact<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  id: NodeID,
  extra: A
): ProvenanceGraph<T, S, A> {
  const newGraph = deepCopy(graph);
  const node = newGraph.nodes[id];

  if (isChildNode(node)) {
    node.artifacts.extra.push({
      time: generateTimeStamp(),
      e: extra
    });
  } else {
    throw new Error('Cannot add artifacts to Root Node');
  }

  return newGraph;
}

export function getExtraFromArtifact<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  id: NodeID
): Extra<A>[] {
  const node = graph.nodes[id];
  if (isChildNode(node)) {
    return node.artifacts.extra;
  }
  throw new Error('Root does not have artifacts');
}

export function applyActionFunction<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  label: string,
  action: ActionFunction<T>,
  complex: boolean,
  ephemeral: boolean,
  args?: any[],
  metadata?: NodeMetadata<S>,
  artifacts: Partial<Artifacts<A>> = {}
): ProvenanceGraph<T, S, A> {
  const newGraph = deepCopy(graph);

  const { current: currentId } = newGraph;

  const currentState = deepCopy(graph.nodes[currentId].getState());

  const createNewStateNode = (
    parent: NodeID,
    state: T,
    diffs: Diff[],
    ephemeral: boolean
  ): StateNode<T, S, A> => ({
    id: generateUUID(),
    label: label,
    metadata: {
      createdOn: generateTimeStamp(),
      ...metadata
    },
    artifacts: {
      diffs,
      extra: [],
      ...artifacts
    },
    parent: parent,
    children: [],
    state: state,
    getState: () => {
      return state;
    },
    ephemeral: ephemeral
  });

  const createNewDiffNode = (
    parent: NodeID,
    previousStateID: NodeID,
    diffs: Diff[],
    ephemeral: boolean
  ): DiffNode<T, S, A> => ({
    id: generateUUID(),
    label: label,
    metadata: {
      createdOn: generateTimeStamp(),
      ...metadata
    },
    artifacts: {
      diffs,
      extra: [],
      ...artifacts
    },
    parent: parent,
    children: [],
    lastStateNode: previousStateID,
    diffs: diffs,
    getState: () => {
      let _state = (newGraph.nodes[previousStateID] as StateNode<T, S, A>).getState();
      let state: T = deepCopy(_state);

      let diffsTemp = diffs;

      if (diffsTemp.length === 0) {
        return state;
      }

      // console.log(JSON.stringify( {_state, diffs}, null, 4 ));

      diffsTemp.forEach((diff: Diff) => {
        applyChange(state, null, diff);
      });

      // console.log(state)

      return state;
    },
    ephemeral: ephemeral
  });

  let currNode = graph.nodes[currentId];
  let backCounter = 0;
  let previousState = undefined;
  let previousStateID = '';

  let d = true;

  if (isChildNode(currNode)) {
    if (isStateNode(currNode)) {
      previousState = currNode.getState();
      previousStateID = currNode.id;
    } else {
      previousState = graph.nodes[currNode.lastStateNode].getState();
      previousStateID = currNode.lastStateNode;
    }
  } else {
    d = false;
    previousState = currNode.getState();
    previousStateID = currNode.id;
  }

  const newState = args ? action(currentState, ...args) : action(currentState);
  const parentId = graph.current;

  let diffs = deepDiff(previousState, newState);

  if (diffs === undefined) {
    diffs = [];
  }

  // TODO:: figure out how to count nested keys
  if (d && Object.keys(previousState).length / 2 < diffs.length) {
    d = false;
  }

  const newNode =
    d && !complex
      ? createNewDiffNode(parentId, previousStateID, diffs, ephemeral)
      : createNewStateNode(parentId, newState, diffs, ephemeral);

  newGraph.nodes[newNode.id] = newNode;
  newGraph.nodes[currentId].children.push(newNode.id);
  newGraph.current = newNode.id;

  // console.log(JSON.stringify(newGraph, null, 2));

  return newGraph;
}
