import { Handler } from "./provenance-core/Handler";
import { ProvenanceGraphTraverser } from "./provenance-core/ProvenanceGraphTraverser";
import { ProvenanceTracker } from "./provenance-core/ProvenanceTracker";
import { ActionFunctionRegistry } from "./provenance-core/ActionFunctionRegistry";
import { ProvenanceGraph } from "./provenance-core/ProvenanceGraph";
import { NodeID } from "./provenance-core/Nodes";

export type DoFunctionTemplate = {
  name: string;
  func: Handler;
  thisArgs: any;
};

export type UndoFunctionTemplate = {
  name: string;
  func: Handler;
  thisArgs: any;
};

export type DoFunction = {
  name: string;
  args: any;
};

export type UndoFunction = {
  name: string;
  args: any;
};

export function Provenance(userId: string = "unknown") {
  let graph = new ProvenanceGraph(userId);
  let registry = new ActionFunctionRegistry();
  let tracker = new ProvenanceTracker(registry, graph);
  let traverser = new ProvenanceGraphTraverser(registry, graph);

  function register(_do: DoFunctionTemplate, _undo?: UndoFunctionTemplate) {
    registry.register(`DO_${_do.name}`, _do.func, _do.thisArgs);
    if (_undo)
      registry.register(`UNDO_${_undo.name}`, _undo.func, _undo.thisArgs);
  }

  async function apply(_do: DoFunction, _undo: UndoFunction) {
    return await tracker.applyAction({
      do: `DO_${_do.name}`,
      doArgs: _do.args,
      undo: `UNDO_${_undo.name}`,
      undoArgs: _undo.args
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
