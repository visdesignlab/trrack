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
import {importPartialState, importState, exportPartialState, exportState, importEitherState} from "./ImportExportActions";

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
  done: () => void;
}

export function initProvenance<T>(initState: T): Provenance<T> {
  const graph = configureStore(createNewGraph<T>(initState));
  const EM = initEventManager<T>();
  let addedObserversFlag = 0;

  return {
    graph: () => deepCopy(graph.getState()),
    applyAction: (actionObject: RecordableAction<T>) => {

      if(addedObserversFlag == 0)
        console.warn("Use done() function to signal the end of observers"
                                              + "and to import existing state from URL");
      const oldState = graph.getState().current.state;
      applyRecordableAction(graph, actionObject);
      const newState = graph.getState().current.state;
      EM.callEvents(oldState, newState);
    },
    done: () => {

      console.log("----- All observers added -----")
      console.log("Triggering import of state if exists in URL");

      importEitherState(graph, EM);

      addedObserversFlag = 1;
    },
    exportPartialState:() => {

      exportPartialState(graph);
    },

    exportState:() => {

      exportState(graph);
    },

    importState:() => {

      importState(graph, EM);
    },

    importPartialState:() => {

        importPartialState(graph, EM);
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
