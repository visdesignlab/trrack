import { applyRecordableAction } from "./ApplyActionFunction";
import { Store } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import { deepCopy } from "../utils/utils";
import { RecordableAction } from "./ActionHelpers/RecordableAction";
import  {EventManager} from "./NonReduxHelpers/EventsManager";

/*
Export partial state util function.
1. Checks if there is a difference between root state and current state.
2. Calculates the partial state.
3. Calls another util function to update the URL
*/
export function exportPartialState<T>(graph: Store<ProvenanceGraph<T>>) {

  var diff = require('deep-diff').diff;
  let statePiece = {};

  let rootState = graph.getState().root.state
  let currentState = graph.getState().current.state;

  var differences = diff(rootState, currentState);

  if(differences == null || differences.length == 0)
    console.log("No diff to export");

  let currentJSON = JSON.parse(JSON.stringify(currentState));
  let rootJSON = JSON.parse(JSON.stringify(rootState))

  for(let key in currentJSON) {
    if(currentJSON[key] != rootJSON[key])
      statePiece[key] = currentJSON[key]
  }

  modifyURL(statePiece);
}

/*
Export partial state util function.
1. Gets the full current node.
2. Calls another util function to update the URL.
*/
export function exportState<T>(graph: Store<ProvenanceGraph<T>>) {
  const currentNode = graph.getState().current;

  modifyURL(currentNode);
}

/*
Import state util function.
1. Gets state from URL using another util function.
2. Calls another util function to modify the state of the provenance graph.
3. Triggers observers based on the state changed.
*/
export function importState<T>(graph: Store<ProvenanceGraph<T>>, EM:EventManager<T>) {

  const oldState = graph.getState().current.state;
  let importedObject = getStateFromURL()

  if(!importedObject.hasOwnProperty('metadata')) {
    console.warn("State in URL does not seem to be a full state object");
    console.warn("Doing nothing");
    console.warn("Do you want to use the partial state import function instead?");
    return;
  }

  applyActionToChangeState(graph, importedObject["state"], "Import Full State");

  EM.callEvents(oldState, importedObject["state"]);
}

/*
Import partial state util function.
1. Gets state from URL using another util function.
2. Calculates the difference from root state.
2. Calls another util function to modify the state of the provenance graph.
3. Triggers observers based on the state changed.
*/
export function importPartialState<T>(graph: Store<ProvenanceGraph<T>>, EM:EventManager<T>) {

  let rootState = graph.getState().current.state;
  let savedRootState =  deepCopy(rootState);

  let importedObject = getStateFromURL();

  if(importedObject.hasOwnProperty('metadata')) {
    console.warn("State in URL seems to be a full state object");
    console.warn("Doing nothing");
    console.warn("Do you want to use the full state import function instead?");
    return;
  }

  for(let key in importedObject) {
    if(importedObject[key] != rootState[key])
      rootState[key] = importedObject[key]
  }

  applyActionToChangeState(graph, rootState, "Import Partial State");

  EM.callEvents(savedRootState, rootState);
}

/*
Import either state util function.
1. Identify if there is a full state or a partial state object in URL.
2. Call the corresponding import state function.
*/
export function importEitherState<T>(graph: Store<ProvenanceGraph<T>>, EM:EventManager<T>) {

  let decodedURL = decodeURI(window.location.href);
  let firstIndexPipe = decodedURL.indexOf("||");
  let lastIndexPipe = decodedURL.lastIndexOf("||");

  if(firstIndexPipe == -1 || lastIndexPipe == -1)
    return;

  let stateFromURL = getStateFromURL();
  if(stateFromURL.hasOwnProperty('metadata'))
    importState(graph, EM);
  else
    importPartialState(graph, EM);
}

/*
Util function to modify URL without reload.
Places the state between double pipe ("||") symbols.
Also checks if there are existing query parameters present in the url.
*/
function modifyURL(toEncode) {

  let queryString = encodeURI(JSON.stringify(toEncode));

  let newURL = "";
  let urlEncodedPipe = encodeURI("||");

  if(window.location.href.indexOf("?") != -1) {
    if(window.location.search.indexOf(urlEncodedPipe) == -1)
      newURL = window.location.href + urlEncodedPipe+queryString+urlEncodedPipe;
    else
      newURL = window.location.href.substr(0, window.location.href.indexOf(urlEncodedPipe)) + urlEncodedPipe+queryString+urlEncodedPipe;
  }
  else
    newURL = window.location.href + "?"+urlEncodedPipe+queryString+urlEncodedPipe

  history.pushState({
    id: 'Exported State'
  }, 'State Exported', newURL)

}

/*
Modify the state of the current provenance.
*/
function applyActionToChangeState<T>(graph: Store<ProvenanceGraph<T>>, newState, label) {

  let actionObject:RecordableAction<T> = {
    label: label,
    action: () => {
      let currentState = graph.getState().current;
      currentState.state = newState;
      return currentState.state;
    },
    args: []
  };

  applyRecordableAction(graph, actionObject);
}

/*
Parse the URL and obtain the provenance state from it.
*/
function getStateFromURL() {

  let decodedURL = decodeURI(window.location.href);
  let firstIndexPipe = decodedURL.indexOf("||");
  let lastIndexPipe = decodedURL.lastIndexOf("||");
  return JSON.parse(decodeURI(decodedURL.substring(firstIndexPipe + 2, lastIndexPipe)));
}
