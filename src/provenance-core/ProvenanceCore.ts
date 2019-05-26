import { createNewGraph } from "./ProvenanceGraph";
import { configureStore } from "./Store";
import { deepCopy } from "../utils/utils";
import { Store } from "redux";
import { NodeID, isStateNode } from "./NodeInterfaces";
import { ReversibleAction } from "./ProvenanceActions";
import { applyAction, applyResetAction } from "./ApplyActionFunction";
import { toNode, toNodeWithState} from "./GotoNodeActions";

export function Provenance<T>(application: Store<T>, resetFunction: string = null) {
  const graph = configureStore(createNewGraph());

  let resetFlag = 0;

  if(resetFunction != null)
    resetFlag = 1;

  return {
    graph: () => deepCopy(graph.getState()),
    apply: <D, U>(
      action: ReversibleAction<D, U>,
      skipFirstDoFunctionCall: boolean = false,
    ) => {
      applyAction(graph, application, action, skipFirstDoFunctionCall);
    },
    applyReset: () => {
      applyResetAction(graph, application, resetFunction)
    },
    goToNode: (id: NodeID) => {
      if(resetFlag == 0)
        toNode(graph, application, id)
      else
        toNodeWithState(graph, application, id, resetFunction)
    },
    goBackOneStep: () => {
      const current = graph.getState().current;
      if (isStateNode(current)) {
        if(resetFlag == 0)
          toNode(graph, application, current.parent);
        else
          toNodeWithState(graph, application, current.parent, resetFunction);
      }
    },
    goBackNSteps: (n: number) => {
      if(resetFlag == 0) {
        while (n != 0) {
          const current = graph.getState().current;
          if (isStateNode(current)) {
            toNode(graph, application, current.parent);
            --n;
          } else {
            break;
          }
        }
      }

      else {
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
