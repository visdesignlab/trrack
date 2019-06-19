import {
  createNewGraph,
  createNewGraphWithoutRedux,
  ProvenanceGraph
} from "./ProvenanceGraph";
import { configureStore } from "./Store";
import { deepCopy, deepCopyReadonly } from "../utils/utils";
import { Store } from "redux";
import { NodeID, isStateNode } from "./NodeInterfaces";
import { ReversibleAction } from "./ProvenanceActions";
import {
  applyAction,
  applyResetAction,
  applyRecordableAction
} from "./ApplyActionFunction";
import { toNode, toNodeWithState } from "./GotoNodeActions";
import { RecordableAction } from "./NonReduxInterfaces/RecordableAction";

export function ProvenanceRedux<T>(
  application: Store<T>,
  resetFunction: string = null
) {
  const graph = configureStore(createNewGraph());

  return {
    graph: () => deepCopy(graph.getState()),
    apply: <D, U>(
      action: ReversibleAction<D, U>,
      skipFirstDoFunctionCall: boolean = false
    ) => {
      applyAction(graph, application, action, skipFirstDoFunctionCall);
    },
    applyReset: () => {
      applyResetAction(graph, application, resetFunction);
    },
    goToNode: (id: NodeID) => {
      if (!resetFunction) toNode(graph, application, id);
      else toNodeWithState(graph, application, id, resetFunction);
    },
    goBackOneStep: () => {
      const current = graph.getState().current;
      if (isStateNode(current)) {
        if (!resetFunction) toNode(graph, application, current.parent);
        else toNodeWithState(graph, application, current.parent, resetFunction);
      }
    },
    goBackNSteps: (n: number) => {
      if (!resetFunction) {
        while (n != 0) {
          const current = graph.getState().current;
          if (isStateNode(current)) {
            toNode(graph, application, current.parent);
            --n;
          } else {
            break;
          }
        }
      } else {
        let current = graph.getState().current;
        let parentVal = "";
        while (n != 0) {
          if (isStateNode(current)) {
            parentVal = current.parent;
            current = graph.getState().nodes[parentVal];
            --n;
          } else {
            break;
          }
        }
        toNodeWithState(graph, application, current.id, resetFunction);
      }
    }
  };
}

const global = "GLOBAL";

export type SubscriberFunction<T> = (state?: T) => void;

export interface Provenance<T> {
  graph: () => ProvenanceGraph<T>;
  applyAction: (actionObject: RecordableAction<T>) => void;
  addObserver: (propPath: string, func: SubscriberFunction<T>) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;
}

export function Provenance<T>(initState: T): Provenance<T> {
  const graph = configureStore(createNewGraphWithoutRedux<T>(initState));
  const subscriberDictionary: { [key: string]: SubscriberFunction<T>[] } = {};

  return {
    graph: () => deepCopy(graph.getState()),
    applyAction: (actionObject: RecordableAction<T>) => {
      const oldState = graph.getState().current.state;
      applyRecordableAction(graph, actionObject);
      const newState = graph.getState().current.state;
      callUpdateEvents(oldState, newState, subscriberDictionary);
    },
    addObserver: (propPath: string, func: SubscriberFunction<T>) => {
      if (!subscriberDictionary[propPath]) subscriberDictionary[propPath] = [];
      subscriberDictionary[propPath].push(func);
    },
    addGlobalObserver: (func: SubscriberFunction<T>) => {
      if (!subscriberDictionary[global]) subscriberDictionary[global] = [];
      subscriberDictionary[global].push(func);
    }
  };
}

function callUpdateEvents<T>(prevState: T, newState: T, subscriberDict: any) {
  if (subscriberDict[global]) {
    if (prevState !== newState)
      subscriberDict[global].forEach(f => f(newState));
    return;
  }

  Object.keys(subscriberDict).forEach(path => {
    const paths = path.split(".");
    const prevValue = paths.reduce((prev, curr) => {
      return prev && prev[curr];
    }, prevState);
    const newValue = paths.reduce((prev, curr) => {
      return prev && prev[curr];
    }, newState);

    if (!(prevValue && newValue)) throw new Error(`Path ${path} is illegal.`);

    if (prevValue !== newValue) subscriberDict[path].forEach(f => f(newState));
  });
}
