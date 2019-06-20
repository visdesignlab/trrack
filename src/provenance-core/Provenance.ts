import { ProvenanceGraph, createNewGraphWithoutRedux } from "./ProvenanceGraph";
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
  goBackOneStep: () => void;
  goBackNSteps: (n: number) => void;
  reset: () => void;
}

export function initProvenance<T>(initState: T): Provenance<T> {
  const graph = configureStore(createNewGraphWithoutRedux<T>(initState));

  const EM = initEventManager<T>();

  return {
    graph: () => deepCopy(graph.getState()),
    applyAction: (actionObject: RecordableAction<T>) => {
      const oldState = graph.getState().current.state;
      applyRecordableAction(graph, actionObject);
      const newState = graph.getState().current.state;
      EM.callEvents(oldState, newState);
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
