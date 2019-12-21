import { Store, AnyAction } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
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
import { RecordableAction } from "./ActionHelpers/RecordableAction";
import { RecordableReduxAction, recordableReduxActionCreator } from "./ActionHelpers/RecordableReduxActions";

export function applyRecordableActionRedux<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  action: RecordableReduxAction,
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
  if (!skipFirstDoFunctionCall) application.dispatch(action);
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

export function importStateFromFile<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  skipFirstDoFunctionCall: boolean = false
) {
  const importAction = recordableReduxActionCreator(
    "Import State",
    "Import State",
    200
  );
  const fs = require('fs');
  var stringVal = fs.readFileSync('/home/sai/Workspaces/independent/provenance-lib-core-forked/provenance-lib-core/src/provenance-core/foo.txt').toString();
  stringVal = JSON.parse(stringVal.trim());
  const createNewStateNode = (
    parent: NodeID,
    actionResult: unknown
  ): StateNode<T> => ({
    id: generateUUID(),
    label: importAction.type,

    metadata: {
      createdOn: generateTimeStamp()
    },
    action: importAction,
    actionResult: actionResult,
    parent: parent,
    children: [],
    artifacts: [],
    state: <T>stringVal
    //state: application.getState()
  });

  let newNode: StateNode<T>;

  const currentNode = graph.getState().current;
  //if (!skipFirstDoFunctionCall) application.dispatch(importAction);
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

export function exportStateToFile<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  skipFirstDoFunctionCall: boolean = false
) {
  const fs = require('fs');

  fs.writeFileSync("sync.txt", JSON.stringify(application.getState()));
}

export function exportPartialStateToFile<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  skipFirstDoFunctionCall: boolean = false
) {
  const rootNode = graph.getState().root;
  const currentNode = graph.getState().current;

  let originalState = rootNode.state
  let currentState = currentNode.state;


  var diff = require('deep-diff').diff;

  var differences = diff(originalState, currentState);

  let i;
  const fs = require('fs');
  let statePiece = {};
  fs.writeFileSync("syncPiece.txt", "");

  for (i = 0 ; i < differences.length ; i++) {

      if(differences[i].kind != "E")
        continue;

      statePiece[differences[i].path[0]] = differences[i].rhs
  }
  fs.appendFile("syncPiece.txt", JSON.stringify(statePiece));
}

export function importPartialStateToFile<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  skipFirstDoFunctionCall: boolean = false
) {
  const rootNode = graph.getState().root;

  let originalState = rootNode.state
  console.log(originalState)

  var fs = require('fs')
  let partJSON = fs.readFileSync("partialJSON.txt", "");

  let i;
  let currentState = {};
  for (let key in Object.keys(originalState)) {
      console.log("key is " + key)
      if(partJSON.hasOwnProperty(key))
        currentState[key] = partJSON[key]
      else
      currentState[key] = originalState[key]
  }
  console.log(JSON.stringify(currentState))
}

export function importStateFromURL<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  application: Store<T>,
  skipFirstDoFunctionCall: boolean = false
) {
  const importAction = recordableReduxActionCreator(
    "Import State from URL",
    "Import State from URL",
    200
  );
  let url_string = window.location.href;
  var url = new URL(url_string);
  var stringVal = url.searchParams.get("state");

  stringVal = JSON.parse(stringVal.trim());
  const createNewStateNode = (
    parent: NodeID,
    actionResult: unknown
  ): StateNode<T> => ({
    id: generateUUID(),
    label: importAction.type,

    metadata: {
      createdOn: generateTimeStamp()
    },
    action: importAction,
    actionResult: actionResult,
    parent: parent,
    children: [],
    artifacts: [],
    state: <T><any>stringVal
    //state: application.getState()
  });

  let newNode: StateNode<T>;

  const currentNode = graph.getState().current;
  if (!skipFirstDoFunctionCall) application.dispatch(importAction);
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
