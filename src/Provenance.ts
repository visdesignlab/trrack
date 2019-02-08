import { createNewGraph, Nodes } from "./provenance-core/ProvenanceGraph";
import {
  createAddNodeAction,
  createUpdateNewlyAddedNodeAction
} from "./provenance-core/NodeActions";
import { configureStore } from "./provenance-core/Store";
import { deepCopy, generateUUID, generateTimeStamp } from "./utils/utils";
import { Store, Action } from "redux";
import {
  StateNode,
  NodeID,
  ProvenanceNode,
  isStateNode
} from "./provenance-core/Nodes";
import {
  createAddChildToCurrentAction,
  createChangeCurrentAction
} from "./provenance-core/CurrentActions";

export type GenericAction<T> = DoAction<T> | UndoAction<T>;

export interface DoAction<T> extends Action {
  readonly type: string;
  args: T;
}

export interface UndoAction<T> extends Action {
  readonly type: string;
  args: T;
}

export interface ReversibleAction<D, U> {
  readonly type: string;
  readonly doAction: DoAction<D>;
  readonly undoAction: UndoAction<U>;
}

export function ReversibleActionCreator<D, U>(
  type: string,
  doArgs: D,
  undoArgs: U
): ReversibleAction<D, U> {
  return {
    type: type,
    doAction: {
      type: `DO_${type}`,
      args: doArgs
    },
    undoAction: {
      type: `UNDO_${type}`,
      args: undoArgs
    }
  };
}

export function Provenance<T>(application: Store<T>) {
  const graph = configureStore(createNewGraph());

  function apply<D, U>(
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

  function gotoNode(id: NodeID) {
    try {
      const currentNode = graph.getState().current;
      const targetNode = graph.getState().nodes[id];

      if (currentNode === targetNode) {
        return;
      }

      const trackToTarget: ProvenanceNode[] = [];
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

      applyActions(application, actions);

      // ! Change current
    } catch (err) {
      throw new Error(err);
    }
  }

  return {
    graph: () => deepCopy(graph.getState()),
    apply: apply,
    goto: gotoNode
  };
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
    const nodesToCheck: ProvenanceNode[] = [
      ...currentNode.children.map(c => nodes[c])
    ];

    if (isStateNode(currentNode)) nodesToCheck.push(nodes[currentNode.id]);

    for (let node of nodesToCheck) {
      if (node === comingFromNode) continue;
      if (findPathToTargetNode(nodes, node, targetNode, track, currentNode)) {
        track.unshift(currentNode);
        return true;
      }
    }
  }

  eval("console").log(track);
  return false;
}
