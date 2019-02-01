import { Handler } from "./provenance-core/Handler";
import { ProvenanceGraphTraverser } from "./provenance-core/ProvenanceGraphTraverser";
import { ProvenanceTracker } from "./provenance-core/ProvenanceTracker";
import { ActionFunctionRegistry } from "./provenance-core/ActionFunctionRegistry";
import { ProvenanceGraph } from "./provenance-core/ProvenanceGraph";
import { NodeID } from "./provenance-core/Nodes";
import { RegisterActionTemplate, ApplyAction } from "./provenance-core/Actions";

export function Provenance(userId: string = "unknown") {
  let graph = new ProvenanceGraph(userId);
  let registry = new ActionFunctionRegistry();
  let tracker = new ProvenanceTracker(registry, graph);
  let traverser = new ProvenanceGraphTraverser(registry, graph);

  function register(action: RegisterActionTemplate) {
    registry.register(`DO_${action.name}`, action.do.func, action.do.thisArgs);
    if (action.undo)
      registry.register(
        `UNDO_${action.name}`,
        action.undo.func,
        action.undo.thisArgs
      );
  }

  async function apply(act: ApplyAction) {
    return await tracker.applyAction({
      do: `DO_${act.name}`,
      doArgs: act.doArgs,
      undo: `UNDO_${act.name}`,
      undoArgs: act.undoArgs
    });
  }

  function goTo(nodeId: NodeID) {
    console.log(Object.assign({}, graph));
    return traverser.toStateNode(nodeId);
  }

  return {
    register: register,
    apply: apply,
    goTo: goTo
  };
}
