import { Store, AnyAction } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import {
  ReversibleAction,
  ResetAction,
  ResetActionCreator
} from "./ProvenanceActions";
import { NodeID, StateNode } from "./NodeInterfaces";
import { generateUUID, generateTimeStamp } from "../utils/utils";
import {
  createAddNodeAction,
  createUpdateNewlyAddedNodeAction
} from "./NodeActions/ActionCreators";
import {
  createAddChildToCurrentAction,
  createChangeCurrentAction
} from "./CurrentActions/ActionCreators";
import { RecordableAction } from "./NonReduxInterfaces/RecordableAction";

export function applyAction<T, D, U>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  action: ReversibleAction<D, U>,
  skipFirstDoFunctionCall: boolean = false
) {
  const createNewStateNode = (
    parent: NodeID,
    actionResult: unknown
  ): StateNode<T> => ({
    id: generateUUID(),
    label: action.type,

    metadata: {
      createdOn: generateTimeStamp()
    },
    action: action,
    actionResult: actionResult,
    parent: parent,
    children: [],
    artifacts: [],
    state: application.getState()
  });

  let newNode: StateNode<T>;

  const currentNode = graph.getState().current;
  if (!skipFirstDoFunctionCall) application.dispatch(action.doAction);
  newNode = createNewStateNode(currentNode.id, null);
  // * Add to nodes list
  graph.dispatch(createAddNodeAction(newNode));
  // * Add as child to current nodeididid
  graph.dispatch(createAddChildToCurrentAction(newNode.id));
  // * Update the node in nodes list
  graph.dispatch(createUpdateNewlyAddedNodeAction(graph.getState().current));
  // * Change Current node
  graph.dispatch(createChangeCurrentAction(newNode));
}

export function applyRecordableAction<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  { label, action, args, thisArg }: RecordableAction<T>,
  skipFirstDoFunctionCall: boolean = false
) {
  const createNewStateNode = (
    parent: NodeID,
    actionResult: unknown,
    newState: T
  ): StateNode<T> => ({
    id: generateUUID(),
    label: label,

    metadata: {
      createdOn: generateTimeStamp()
    },
    action: action as any,
    actionResult: actionResult,
    parent: parent,
    children: [],
    artifacts: [],
    state: newState
  });

  const currentNode = graph.getState().current;
  let newState: T = null;

  if (!skipFirstDoFunctionCall)
    if (thisArg) newState = action.apply(thisArg, args);
    else newState = action.apply(null, args);

  const newNode = createNewStateNode(currentNode.id, null, newState);
  // * Add to nodes list
  graph.dispatch(createAddNodeAction(newNode));
  // * Add as child to current nodeididid
  graph.dispatch(createAddChildToCurrentAction(newNode.id));
  // * Update the node in nodes list
  graph.dispatch(createUpdateNewlyAddedNodeAction(graph.getState().current));
  // * Change Current node
  graph.dispatch(createChangeCurrentAction(newNode));
}

export function applyResetAction<T, D, U>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  inputString: string
) {
  const createResetAction = (toSet: any): ResetAction<any> => {
    return ResetActionCreator(inputString, toSet);
  };

  let action = createResetAction(application.getState());

  const createNewStateNode = (
    parent: NodeID,
    actionResult: unknown
  ): StateNode<T> => ({
    id: generateUUID(),
    label: action.type,

    metadata: {
      createdOn: generateTimeStamp()
    },
    action: action,
    actionResult: actionResult,
    parent: parent,
    children: [],
    artifacts: [],
    state: application.getState()
  });

  let newNode: StateNode<T>;

  const currentNode = graph.getState().current;

  newNode = createNewStateNode(currentNode.id, null);

  application.dispatch(action.doAction);

  // * Add to nodes list
  graph.dispatch(createAddNodeAction(newNode));
  // * Add as child to current nodeididid
  graph.dispatch(createAddChildToCurrentAction(newNode.id));
  // * Update the node in nodes list
  graph.dispatch(createUpdateNewlyAddedNodeAction(graph.getState().current));
  // * Change Current node
  graph.dispatch(createChangeCurrentAction(newNode));
}
