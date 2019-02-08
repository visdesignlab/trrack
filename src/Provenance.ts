import { createNewGraph } from "./provenance-core/ProvenanceGraph";
import {
  createAddNodeAction,
  createUpdateNewlyAddedNodeAction
} from "./provenance-core/NodeActions";
import { configureStore } from "./provenance-core/Store";
import { deepCopy, generateUUID, generateTimeStamp } from "./utils/utils";
import { Store, Action } from "redux";
import { StateNode, NodeID } from "./provenance-core/Nodes";
import {
  createAddChildToCurrentAction,
  createChangeCurrentAction
} from "./provenance-core/CurrentActions";

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

  return {
    graph: () => deepCopy(graph.getState()),
    apply: apply
  };
}
