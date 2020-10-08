import { action, observable } from 'mobx';
import { Diff } from 'deep-diff';
import { ProvenanceGraph } from '../Types/ProvenanceGraph';
import {
  RootNode,
  NodeID,
  StateNode,
  isChildNode,
  DiffNode,
  getState,
  isDiffNode,
  Meta,
} from '../Types/Nodes';
import generateUUID from '../Utils/generateUUID';
import generateTimeStamp from '../Utils/generateTimeStamp';
import deepDiff from '../Utils/DeepDiff';
import { ActionObject, ActionType } from '../Types/Action';

export function createProvenanceGraph<T, S, A>(
  state: T,
): ProvenanceGraph<T, S, A> {
  const root: RootNode<T, S> = {
    id: generateUUID(),
    label: 'Root',
    metadata: {
      createdOn: generateTimeStamp(),
      eventType: 'Root',
    },
    children: [],
    state,
    actionType: 'Regular',
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
  label: string,
  diffs: Diff<T>[],
  actionType: ActionType,
  eventType: S,
  meta: Meta,
): StateNode<T, S, A> {
  return {
    id: generateUUID(),
    label,
    metadata: {
      createdOn: generateTimeStamp(),
      eventType,
      ...meta,
    },
    artifacts: {
      diffs,
      extra: [],
    },
    parent,
    children: [],
    state,
    actionType,
    bookmarked: false,
  };
}

function createNewDiffNode<T, S, A>(
  parent: NodeID,
  label: string,
  diffs: Diff<T>[],
  actionType: ActionType,
  previousStateId: NodeID,
  eventType: S,
  meta: Meta,
): DiffNode<T, S, A> {
  return {
    id: generateUUID(),
    label,
    metadata: {
      createdOn: generateTimeStamp(),
      eventType,
      ...meta,
    },
    artifacts: {
      diffs,
      extra: [],
    },
    parent,
    children: [],
    lastStateNode: previousStateId,
    diffs,
    actionType,
    bookmarked: false,
  };
}

export const updateMobxObservable = action(<T>(oldObject: T, newObject: T) => {
  Object.keys(oldObject).forEach((k) => {
    const key: Extract<keyof T, string> = k as any;
    const oldValue = oldObject[key];
    const newValue = newObject[key];
    if (newValue !== oldValue) {
      let val = newObject[key];
      val = (typeof val).toString() === 'object' ? observable(val) : val;
      oldObject[key] = val;
    }
  });
});

export const goToNode = action(
  <T, S, A>(graph: ProvenanceGraph<T, S, A>, state: T, id: NodeID) => {
    const newCurrentNode = graph.nodes[id];
    if (!newCurrentNode) throw new Error(`Node with id: ${id} does not exist`);
    graph.current = newCurrentNode.id;
    const currentState = getState(graph, graph.nodes[graph.current]);

    updateMobxObservable(state, currentState);
  },
);

export const applyActionFunction = action(
  <T, S, A>(
    _graph: ProvenanceGraph<T, S, A>,
    actionFn: ActionObject<T, S>,
    currentState: T,
  ) => {
    const graph = _graph;

    const { current: currentId } = graph;
    const currentNode = graph.nodes[currentId];
    let previousState: T | null = null;
    let previousStateID: NodeID | null = null;

    if (isDiffNode(currentNode)) {
      previousState = getState(graph, graph.nodes[currentNode.lastStateNode]);
      previousStateID = currentNode.lastStateNode;
    } else {
      previousState = getState(graph, currentNode);
      previousStateID = currentNode.id;
    }

    let saveDiff = isChildNode(currentNode);

    const {
      state,
      stateSaveMode,
      actionType,
      label,
      eventType,
      meta,
    } = actionFn.apply(currentState);

    const parentId = graph.current;

    const diffs = deepDiff(previousState, state) || [];

    if (saveDiff && Object.keys(previousState).length / 2 < diffs.length) {
      saveDiff = false;
    }

    saveDiff = saveDiff && stateSaveMode === 'Diff';

    const newNode = saveDiff
      ? createNewDiffNode<T, S, A>(
        parentId,
        label,
        diffs,
        actionType,
        previousStateID,
        eventType,
        meta,
      )
      : createNewStateNode<T, S, A>(
        parentId,
        state,
        label,
        diffs,
        actionType,
        eventType,
        meta,
      );

    graph.nodes[newNode.id] = newNode;
    graph.nodes[currentId].children.push(newNode.id);
    graph.current = newNode.id;
    return graph.nodes[graph.current];
    // End
  },
);

export const importState = action(
  <T, S, A>(graph: ProvenanceGraph<T, S, A>, importedState: T) => {
    const currentState = getState(graph, graph.nodes[graph.current]);
    const diffs = deepDiff(currentState, importedState) || [];

    const newNode = createNewStateNode(
      graph.current,
      importedState,
      'Import',
      diffs,
      'Regular',
      null as any,
      {},
    );

    graph.nodes[newNode.id] = newNode;
    graph.current = newNode.id;
  },
);
