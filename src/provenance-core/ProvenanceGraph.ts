import { AnyAction, Store } from "redux";
import { generateTimeStamp, generateUUID } from "../utils/utils";
import {
  createAddChildToCurrentAction,
  createChangeCurrentAction
} from "./CurrentActions";
import {
  addNode,
  createAddNodeAction,
  createUpdateNewlyAddedNodeAction
} from "./NodeActions";
import {
  isStateNode,
  NodeID,
  ProvenanceNode,
  RootNode,
  StateNode
} from "./Nodes";
import { GenericAction, ReversibleAction } from "./ProvenanceActions";

export type Nodes = { [key: string]: ProvenanceNode };
export type CurrentNode = ProvenanceNode;

export interface ProvenanceGraph {
  nodes: Nodes;
  current: CurrentNode;
  root: RootNode;
}

export function createNewGraph(_root?: RootNode): ProvenanceGraph {
  let root: RootNode = undefined;
  if (_root) {
    root = _root;
  } else {
    root = {
      id: generateUUID(),
      label: "Root",
      metadata: {
        createdOn: generateTimeStamp()
      },
      artifacts: {},
      children: []
    };
  }

  const graph: ProvenanceGraph = {
    nodes: {},
    root: root,
    current: root
  };

  graph.nodes = addNode(graph.nodes, root);
  return graph;
}

export function applyAction<T, D, U>(
  graph: Store<ProvenanceGraph, AnyAction>,
  application: Store<T>,
  action: ReversibleAction<D, U>,
  skipFirstDoFunctionCall: boolean = false
) {
  const createNewStateNode = (
    parent: NodeID,
    actionResult: unknown
  ): StateNode => ({
    id: generateUUID(),
    label: action.type,
    metadata: {
      createdOn: generateTimeStamp()
    },
    action: action,
    actionResult: actionResult,
    parent: parent,
    children: [],
    artifacts: []
  });

  let newNode: StateNode;

  const currentNode = graph.getState().current;
  if (!skipFirstDoFunctionCall) application.dispatch(action.doAction);
  newNode = createNewStateNode(currentNode.id, null);

  // * Add to nodes list
  graph.dispatch(createAddNodeAction(newNode));
  // * Add as child to current node
  graph.dispatch(createAddChildToCurrentAction(newNode.id));
  // * Update the node in nodes list
  graph.dispatch(createUpdateNewlyAddedNodeAction(graph.getState().current));
  // * Change Current node
  graph.dispatch(createChangeCurrentAction(newNode));
}

export function toNode<T>(
  graph: Store<ProvenanceGraph, AnyAction>,
  id: NodeID
) {
  try {
    const currentNode = graph.getState().current;
    const targetNode = graph.getState().nodes[id];
    if (currentNode === targetNode) return;

    const trackToTarget: ProvenanceNode[] = [];
    if (!currentNode && !targetNode) return;

    const success = findPathToTargetNode(
      graph.getState().nodes,
      currentNode,
      targetNode,
      trackToTarget
    );

    if (!success) {
      throw new Error("No Path found!");
    }
    const actions: GenericAction<unknown>[] = [];

    for (let i = 0; i < trackToTarget.length - 1; ++i) {
      const thisNode = trackToTarget[i];
      const nextNode = trackToTarget[i + 1];

      const up = isNextNodeInTrackUp(thisNode, nextNode);
      if (up) {
        if (isStateNode(thisNode)) {
          actions.push(thisNode.action.undoAction);
        } else {
          throw new Error("At root node!");
        }
      } else {
        if (isStateNode(nextNode)) {
          actions.push(nextNode.action.doAction);
        } else {
          throw new Error("At root node!");
        }
      }
    }

    // applyActions(application, actions);

    // ! Change current
    graph.dispatch(createChangeCurrentAction(targetNode));
  } catch (err) {
    throw new Error(err);
  }
}

function applyActions<T>(app: Store<T>, actions: GenericAction<unknown>[]) {
  for (let i = 0; i < actions.length; ++i) app.dispatch(actions[i]);
}

function isNextNodeInTrackUp(
  currentNode: ProvenanceNode,
  nextNode: ProvenanceNode
): boolean {
  if (isStateNode(currentNode) && currentNode.parent === nextNode.id) {
    return true;
  } else if (isStateNode(nextNode) && nextNode.parent != currentNode.id) {
    throw new Error("Unconnected nodes.");
  }
  return false;
}

function findPathToTargetNode(
  nodes: Nodes,
  currentNode: ProvenanceNode,
  targetNode: ProvenanceNode,
  track: ProvenanceNode[],
  comingFromNode: ProvenanceNode = currentNode
): boolean {
  if (currentNode && currentNode === targetNode) {
    track.unshift(currentNode);
    return true;
  } else if (currentNode) {
    const nodesToCheck: ProvenanceNode[] = currentNode.children.map(
      c => nodes[c]
    );

    if (isStateNode(currentNode)) {
      nodesToCheck.push(nodes[currentNode.parent]);
    }

    for (let node of nodesToCheck) {
      if (node === comingFromNode) continue;
      if (findPathToTargetNode(nodes, node, targetNode, track, currentNode)) {
        track.unshift(currentNode);
        return true;
      }
    }
  }

  return false;
}
