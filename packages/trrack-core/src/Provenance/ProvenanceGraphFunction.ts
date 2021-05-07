/* eslint-disable no-shadow */
import { Diff } from 'deep-diff';
import { action } from 'mobx';
import { ActionType, ApplyObject } from '../Types/Action';
import {
  DiffNode,
  getState,
  isChildNode,
  isDiffNode,
  Meta,
  NodeID,
  RootNode,
  StateNode,
} from '../Types/Nodes';
import { ProvenanceGraph } from '../Types/ProvenanceGraph';
import { JsonValue, Serializer } from '../Types/Serializers';
import differ from '../Utils/Differ';
import generateTimeStamp from '../Utils/generateTimeStamp';
import generateUUID from '../Utils/generateUUID';

export function createProvenanceGraph<S, A>(state: JsonValue): ProvenanceGraph<S, A> {
  const root: RootNode<S> = {
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

  const graph: ProvenanceGraph<S, A> = {
    nodes: {
      [root.id]: root,
    },
    root: root.id,
    current: root.id,
  };

  return graph;
}

function createNewStateNode<S, A>(
  parent: NodeID,
  state: JsonValue,
  label: string,
  actionType: ActionType,
  eventType: S,
  meta: Meta,
): StateNode<S, A> {
  return {
    id: generateUUID(),
    label,
    metadata: {
      createdOn: generateTimeStamp(),
      eventType,
      ...meta,
    },
    artifacts: {
      annotations: [],
      customArtifacts: [],
    },
    parent,
    children: [],
    state,
    actionType,
    bookmarked: false,
  };
}

function createNewDiffNode<S, A>(
  parent: NodeID,
  label: string,
  diffs: Diff<JsonValue>[],
  actionType: ActionType,
  previousStateId: NodeID,
  eventType: S,
  meta: Meta,
): DiffNode<S, A> {
  return {
    id: generateUUID(),
    label,
    metadata: {
      createdOn: generateTimeStamp(),
      eventType,
      ...meta,
    },
    artifacts: {
      annotations: [],
      customArtifacts: [],
    },
    parent,
    children: [],
    lastStateNode: previousStateId,
    diffs,
    actionType,
    bookmarked: false,
  };
}

// export const updateMobxObservable = action(<T>(oldObject: T, newObject: T) => {
//   Object.keys(oldObject).forEach((k) => {
//     const key: Extract<keyof T, string> = k as any;
//     const oldValue = oldObject[key];
//     const newValue = newObject[key];
//     if (newValue !== oldValue) {
//       let val = newObject[key];
//       val = (typeof val).toString() === 'object' ? observable(val) : val;
//       oldObject[key] = val;
//     }
//   });
// });

export const goToNode = action(<S, A>(graph: ProvenanceGraph<S, A>, id: NodeID) => {
  const newCurrentNode = graph.nodes[id];
  if (!newCurrentNode) throw new Error(`Node with id: ${id} does not exist`);
  graph.current = newCurrentNode.id;
});

export const applyActionFunction = action(
  <T, S, A>(
    _graph: ProvenanceGraph<S, A>,
    actionFn: ApplyObject<T, S>,
    currentState: T,
    // eslint-disable-next-line no-unused-vars
    serialize: Serializer<T>,
    customLabel?: string,
  ) => {
    const graph = _graph;

    const { current: currentId } = graph;
    const currentNode = graph.nodes[currentId];
    let previousState: JsonValue | null = null;
    let previousStateID: NodeID | null = null;

    if (isDiffNode(currentNode)) {
      previousState = getState(graph, graph.nodes[currentNode.lastStateNode]);
      previousStateID = currentNode.lastStateNode;
    } else {
      previousState = getState(graph, currentNode);
      previousStateID = currentNode.id;
    }

    let saveDiff = isChildNode(currentNode);

    const { state, stateSaveMode, actionType, label, eventType, meta } = actionFn.apply(
      currentState,
      customLabel,
    );

    const parentId = graph.current;

    const serializedState = serialize(state);

    const diffs = differ(previousState, serializedState) || [];

    if (saveDiff && Object.keys(previousState).length / 2 < diffs.length) {
      saveDiff = false;
    }

    saveDiff = saveDiff && stateSaveMode === 'Diff';

    const newNode = saveDiff
      ? createNewDiffNode<S, A>(
          parentId,
          label,
          diffs,
          actionType,
          previousStateID,
          eventType,
          meta,
        )
      : createNewStateNode<S, A>(parentId, serializedState, label, actionType, eventType, meta);

    graph.nodes[newNode.id] = newNode;
    graph.nodes[currentId].children.push(newNode.id);
    graph.current = newNode.id;

    return graph.nodes[graph.current];
    // End
  },
);

export const importState = action(
  <S, A>(graph: ProvenanceGraph<S, A>, importedState: JsonValue) => {
    const newNode = createNewStateNode(
      graph.current,
      importedState,
      'Import',
      'Regular',
      (null as unknown) as S,
      {},
    );

    graph.nodes[newNode.id] = newNode;
    graph.current = newNode.id;
  },
);
