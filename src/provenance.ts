import { ProvenanceGraphTraverser } from "./provenance-core/ProvenanceGraphTraverser";
import { ProvenanceTracker } from "./provenance-core/ProvenanceTracker";
import { ActionFunctionRegistry } from "./provenance-core/ActionFunctionRegistry";
import { ProvenanceGraph } from "./provenance-core/ProvenanceGraph";
import { NodeID, isStateNode } from "./provenance-core/Nodes";
import { RegisterActionTemplate, ApplyAction } from "./provenance-core/Actions";
import {
  SerializedProveananceGraph,
  SerializedProvenanceNode,
  SerializedStateNode
} from "./provenance-core/SerializedInterfaces";
export function Provenance(
  _graph?: SerializedProveananceGraph,
  userId: string = "unknown"
) {
  let graph = new ProvenanceGraph(userId);

  if (_graph) graph = deserializeGraph(_graph);

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
    return traverser.toStateNode(nodeId);
  }

  function getGraph(): ProvenanceGraph {
    return deserializeGraph(serializeGraph());
  }

  function serializeGraph(): SerializedProveananceGraph {
    const nodes = Object.keys(graph.nodes).map((id: string) => {
      const node = graph.getNode(id);
      const serialziedNode: SerializedProvenanceNode = { ...node } as any;
      if (isStateNode(node)) {
        (serialziedNode as SerializedStateNode).parent = node.parent.id;
      }
      serialziedNode.children = node.children.map(child => child.id);
      return serialziedNode;
    });

    return {
      nodes,
      root: graph.root.id,
      current: graph.current.id
    };
  }

  function deserializeGraph(
    _graph: SerializedProveananceGraph | string
  ): ProvenanceGraph {
    let serializedGraph: SerializedProveananceGraph = null;
    if (_graph instanceof String) {
      serializedGraph = JSON.parse(_graph as string);
    } else {
      serializedGraph = _graph as SerializedProveananceGraph;
    }

    const nodes: { [key: string]: any } = {};

    for (let node of serializedGraph.nodes) {
      nodes[node.id] = { ...node };
    }

    for (let nodeId of Object.keys(nodes)) {
      const node = nodes[nodeId];
      node.children = node.children.map(id => nodes[id]);
      if ("parent" in node) node.parent = nodes[node.parent];
    }

    const graph = new ProvenanceGraph();
    (graph as any)._nodes = nodes;
    (graph as any)._current = nodes[serializedGraph.current];
    (graph as any).root = nodes[serializedGraph.root];

    return graph;
  }

  return {
    register: register,
    apply: apply,
    to: goTo,
    graph: getGraph,
    serialize: () => JSON.stringify(serializeGraph())
  };
}
