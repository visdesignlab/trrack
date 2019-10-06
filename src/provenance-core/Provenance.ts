import { ProvenanceGraph, createNewGraph } from "./ProvenanceGraph";
import { RecordableAction } from "./ActionHelpers/RecordableAction";
import {
  SubscriberFunction,
  initEventManager
} from "./NonReduxHelpers/EventsManager";
import { NodeID, isStateNode } from "./NodeInterfaces";
import { configureStore } from "./Store";
import { deepCopy } from "../utils/utils";
import { applyRecordableAction } from "./ApplyActionFunction";
import { toNode } from "./GotoNodeActions";

export interface Provenance<T> {
  graph: () => ProvenanceGraph<T>;
  applyAction: (actionObject: RecordableAction<T>) => void;
  addObserver: (propPath: string, func: SubscriberFunction<T>) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;
  goToNode: (id: NodeID) => void;
  exportPartialState:() => void;
  exportState:() => void;
  importState:() => void;
  importPartialState:() => void;
  goBackOneStep: () => void;
  goBackNSteps: (n: number) => void;
  reset: () => void;
}

export function initProvenance<T>(initState: T): Provenance<T> {
  const graph = configureStore(createNewGraph<T>(initState));
  const EM = initEventManager<T>();

  return {
    graph: () => deepCopy(graph.getState()),
    applyAction: (actionObject: RecordableAction<T>) => {
      const oldState = graph.getState().current.state;
      applyRecordableAction(graph, actionObject);
      const newState = graph.getState().current.state;
      EM.callEvents(oldState, newState);
    },
    exportPartialState:() => {
      const rootNode = graph.getState().root;
      const currentNode = graph.getState().current;

      let originalState = rootNode.state
      let currentState = currentNode.state;

      var diff = require('deep-diff').diff;

      var differences = diff(originalState, currentState);

      let i;

      let statePiece = {};

      if(differences == null || differences.length === 0)
        console.log("No diff to export");

      let currentJSON = JSON.parse(JSON.stringify(currentState));
      let originalJSON = JSON.parse(JSON.stringify(originalState))

      for(let key in currentJSON) {
        if(currentJSON[key] != originalJSON[key])
          statePiece[key] = currentJSON[key]
      }

      let queryString = btoa(JSON.stringify(statePiece));

      window.location.search = "?" + queryString;
    },

    exportState:() => {
      const currentNode = graph.getState().current;

      let queryString = btoa(JSON.stringify(currentNode));
      window.location.search = "?" + queryString;
    },

    importState:() => {

      const oldState = graph.getState().current.state;

      let stateString = window.location.search.substring(1);
      let importedObject = JSON.parse(atob(stateString));

      let actionObject:RecordableAction<T> = {
        label: "Import Data",
        action: () => {
          let currentState = graph.getState().current;
          currentState.state = importedObject["state"];
          return currentState.state;
        },
        args: []
      };

      applyRecordableAction(graph, actionObject);

      const newState = graph.getState().current.state;
      EM.callEvents(oldState, newState);
    },

    importPartialState:() => {

      let oldState = graph.getState().current.state;
      let savedOldState =  deepCopy(oldState);

      let stateString = window.location.search.substring(1);

      let importedObject = JSON.parse(atob(stateString));

      for(let key in importedObject) {
        if(importedObject[key] != oldState[key])
          oldState[key] = importedObject[key]
      }

      let actionObject:RecordableAction<T> = {
        label: "Import Data",
        action: () => {
          let currentState = graph.getState().current;
          currentState.state = oldState;
          return oldState;
        },
        args: []
      };

      applyRecordableAction(graph, actionObject);

      const newState = graph.getState().current.state;
      EM.callEvents(savedOldState, newState);
    },


    addObserver: (propPath: string, func: SubscriberFunction<T>) => {
      EM.addObserver(propPath, func);
    },
    addGlobalObserver: (func: SubscriberFunction<T>) => {
      EM.addGlobalObserver(func);
    },
    goToNode: (id: NodeID) => {
      const prevState = graph.getState().current.state;
      const newState = toNode(graph, id);
      EM.callEvents(prevState, newState);
    },
    goBackOneStep: () => {
      const current = graph.getState().current;
      const prevState = current.state;
      let newState = current.state;
      if (isStateNode(current)) newState = toNode(graph, current.parent);

      EM.callEvents(prevState, newState);
    },
    goBackNSteps: (n: number) => {
      let current = graph.getState().current;
      const prevState = current.state;
      let newState = current.state;
      while (n > 0) {
        current = graph.getState().current;
        if (isStateNode(current)) newState = toNode(graph, current.parent);
        else break;
        --n;
      }

      EM.callEvents(prevState, newState);
    },
    reset: () => {
      const prevState = graph.getState().current.state;
      const newState = toNode(graph, graph.getState().root.id);
      EM.callEvents(prevState, newState);
    }
  };
}
