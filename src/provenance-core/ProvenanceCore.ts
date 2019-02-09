import { createNewGraph } from "./ProvenanceGraph";
import { configureStore } from "./Store";
import { deepCopy } from "../utils/utils";
import { Store } from "redux";
import { NodeID } from "./NodeInterfaces";
import { ReversibleAction } from "./ProvenanceActions";
import { applyAction } from "./ApplyActionFunction";
import { toNode } from "./GotoNodeActions";

export function Provenance<T>(application: Store<T>) {
  const graph = configureStore(createNewGraph());

  return {
    graph: () => deepCopy(graph.getState()),
    apply: <D, U>(
      action: ReversibleAction<D, U>,
      skipFirstDoFunctionCall: boolean = false
    ) => {
      applyAction(graph, application, action, skipFirstDoFunctionCall);
    },
    goto: (id: NodeID) => toNode(graph, application, id)
  };
}
