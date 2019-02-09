import {
  createNewGraph,
  applyAction,
  toNode
} from "./provenance-core/ProvenanceGraph";
import { configureStore } from "./provenance-core/Store";
import { deepCopy } from "./utils/utils";
import { Store } from "redux";
import { NodeID } from "./provenance-core/Nodes";
import { ReversibleAction } from "./provenance-core/ProvenanceActions";

export function Provenance<T>(application: Store<T>) {
  const graph = configureStore(createNewGraph());

  function apply<D, U>(
    action: ReversibleAction<D, U>,
    skipFirstDoFunctionCall: boolean = false
  ) {
    applyAction(graph, application, action, skipFirstDoFunctionCall);
  }

  function gotoNode(id: NodeID) {
    toNode(graph, application, id);
  }

  return {
    graph: () => deepCopy(graph.getState()),
    apply: apply,
    goto: gotoNode
  };
}
