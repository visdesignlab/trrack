import { Store, AnyAction } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import { ReversibleAction, ResetAction, ResetActionCreator } from "./ProvenanceActions";
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

export function applyAction<T, D, U>(
  graph: Store<ProvenanceGraph, AnyAction>,
  application: Store<T>,
  action: ReversibleAction<D, U>,
  skipFirstDoFunctionCall: boolean = false) {

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
    artifacts: [],
    state: application.getState()
  });

  let newNode: StateNode;

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

export function applyResetAction<T, D, U>(
  graph: Store<ProvenanceGraph, AnyAction>,
  application: Store<T>,
  inputString: string) {

  const createResetAction = (toSet: any) : ResetAction<any> => {
    return ResetActionCreator(inputString, toSet);
  };

  let action = createResetAction(application.getState());

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
    artifacts: [],
    state: application.getState()
  });

  let newNode: StateNode;

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
