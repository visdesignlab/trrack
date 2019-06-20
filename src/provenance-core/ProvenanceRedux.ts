import { Store } from "redux";
import { configureStore } from "./Store";
import { createNewGraph, ProvenanceGraph } from "./ProvenanceGraph";
import { deepCopy } from "../utils/utils";
import { RecordableReduxAction } from "./ActionHelpers/RecordableReduxActions";
import { applyRecordableActionRedux } from "./ApplyActionFunction";
import { NodeID, isStateNode } from "./NodeInterfaces";
import { toNodeRedux } from "./GotoNodeActions";

export interface ProvenanceRedux<T> {
  graph: () => ProvenanceGraph<T>;
  apply: (
    action: RecordableReduxAction,
    skipFirstDoFunctionCall?: boolean
  ) => void;
  goToNode: (id: NodeID) => void;
  goBackOneStep: () => void;
  goBackNSteps: (n: number) => void;
  reset: () => void;
}

export function initProvenanceRedux<T>(
  applicationStore: Store<T>,
  resetStore: (newState: T) => void
): ProvenanceRedux<T> {
  const graph = configureStore<T>(createNewGraph());

  return {
    graph: () => deepCopy(graph.getState()),
    apply: (
      action: RecordableReduxAction,
      skipFirstDoFunctionCall: boolean = false
    ) => {
      applyRecordableActionRedux(
        graph,
        applicationStore,
        action,
        skipFirstDoFunctionCall
      );
    },
    goToNode: (id: NodeID) => {
      toNodeRedux(graph, id);
      resetStore(graph.getState().current.state);
    },
    goBackOneStep: () => {
      const current = graph.getState().current;
      if (isStateNode(current)) {
        toNodeRedux(graph, current.parent);
        resetStore(graph.getState().current.state);
      }
    },
    goBackNSteps: (n: number) => {
      let current = graph.getState().current;
      while (n > 0) {
        current = graph.getState().current;
        if (isStateNode(current)) toNodeRedux(graph, current.parent);
        else break;
        --n;
      }
      resetStore(graph.getState().current.state);
    },
    reset: () => {
      toNodeRedux(graph, graph.getState().root.id);
      resetStore(graph.getState().current.state);
    }
  };
}
