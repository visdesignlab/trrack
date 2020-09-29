const applyChange = require('deep-diff').applyChange;

import { ProvenanceGraph } from '../Interfaces/ProvenanceGraph';
import {
  RootNode,
  NodeID,
  Diff,
  StateNode,
  isChildNode,
  isStateNode,
  DiffNode,
} from '../Interfaces/NodeInterfaces';
import generateUUID from '../Utils/generateUUID';
import generateTimeStamp from '../Utils/generateTimeStamp';
import { ActionObject } from '../Provenance/InitializeProvenance';
import deepCopy from '../Utils/DeepCopy';
import deepDiff from '../Utils/DeepDiff';
import { action, extendObservable, observable, set, toJS } from 'mobx';

export function createProvenanceGraph<T, S, A>(state: T): ProvenanceGraph<T, S, A> {
  const root: RootNode<T, S> = {
    id: generateUUID(),
    label: 'Root',
    metadata: {
      createdOn: generateTimeStamp(),
      type: 'Root',
    },
    children: [],
    state: state,
    getState: () => {
      return state;
    },
    ephemeral: false,
    bookmarked: false,
  };

  const graph: ProvenanceGraph<T, S, A> = {
    nodes: {
      [root.id]: root,
    },
    root: root.id,
    current: root.id,
  };

  return graph;
}

function createNewStateNode<T, S, A>(
  parent: NodeID,
  state: T,
  diffs: Diff[],
  label: string,
  ephemeral: boolean,
  bookmarked: boolean
): StateNode<T, S, A> {
  return {
    id: generateUUID(),
    label: label,
    metadata: {
      createdOn: generateTimeStamp(),
    },
    artifacts: {
      diffs,
      extra: [],
    },
    parent,
    children: [],
    state,
    ephemeral,
    bookmarked,
    getState: () => state,
  };
}

function createNewDiffNode<T, S, A>(
  parent: NodeID,
  diffs: Diff[],
  label: string,
  ephemeral: boolean,
  bookmarked: boolean,
  graph: ProvenanceGraph<T, S, A>,
  previousStateId: NodeID
): DiffNode<T, S, A> {
  return {
    id: generateUUID(),
    label: label,
    metadata: {
      createdOn: generateTimeStamp(),
    },
    artifacts: {
      diffs,
      extra: [],
    },
    parent,
    children: [],
    lastStateNode: previousStateId,
    diffs,
    ephemeral,
    bookmarked,
    getState: () => {
      let _state = (graph.nodes[previousStateId] as StateNode<T, S, A>).getState();
      let state: T = deepCopy(_state);

      if (diffs.length === 0) return state;

      diffs.forEach((diff: Diff) => {
        applyChange(state, null, diff);
      });
      return state;
    },
  };
}

export const goToNode = action(<T, S, A>(graph: ProvenanceGraph<T, S, A>, state: T, id: NodeID) => {
  const newCurrentNode = graph.nodes[id];
  if (!newCurrentNode) throw new Error(`Node with id: ${id} does not exist`);
  graph.current = newCurrentNode.id;
  const currentState = graph.nodes[graph.current].getState();
  // console.log(currentState, toJS(state));
  for (let k in currentState) {
    const val = currentState[k];
    if (JSON.stringify(toJS(state[k])) !== JSON.stringify(val)) {
      if ((typeof val).toString() === 'object') state[k] = observable(val);
      else state[k] = val;
      console.log(val);
    }
  }
});

export const applyActionFunction = action(
  <T, S, A>(graph: ProvenanceGraph<T, S, A>, action: ActionObject<T>, currentState: T) => {
    const { current: currentId } = graph;
    let currentNode = graph.nodes[currentId];
    let previousState: T | null = null;
    let previousStateID: NodeID | null = null;

    let d = true;

    if (isChildNode(currentNode)) {
      if (isStateNode(currentNode)) {
        previousState = currentNode.getState();
        previousStateID = currentNode.id;
      } else {
        previousState = graph.nodes[currentNode.lastStateNode].getState();
        previousStateID = currentNode.lastStateNode;
      }
    } else {
      d = false;
      previousState = currentNode.getState();
      previousStateID = currentNode.id;
    }

    const { state, complex, ephemeral, label } = action.apply(currentState);
    const parentId = graph.current;

    let diffs = deepDiff(previousState, state);

    if (!diffs) diffs = [];

    if (d && Object.keys(previousState).length / 2 < diffs.length) {
      d = false;
    }
    const bookmarked: boolean = false;
    const newNode =
      d && !complex
        ? createNewDiffNode<T, S, A>(
            parentId,
            diffs,
            label,
            ephemeral,
            bookmarked,
            graph,
            previousStateID
          )
        : createNewStateNode<T, S, A>(parentId, state, diffs, label, ephemeral, bookmarked);

    graph.nodes[newNode.id] = newNode;
    graph.nodes[currentId].children.push(newNode.id);
    graph.current = newNode.id;
    return graph.nodes[graph.current];
    // End
  }
);
