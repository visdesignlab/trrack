import { generateTimeStamp, generateUUID } from "../utils/utils";
import { RootNode, CurrentNode, Nodes } from "./NodeInterfaces";
import { addNode } from "./NodeActions/Reducer";

export interface ProvenanceGraph {
  nodes: Nodes;
  current: CurrentNode;
  root: RootNode;
}

export function createNewGraph(_root?: RootNode): ProvenanceGraph {
  let root: RootNode = undefined;
  if (_root) {
    root = _root;
  } else {
    root = {
      id: generateUUID(),
      label: "Root",
      metadata: {
        createdOn: generateTimeStamp()
      },
      artifacts: {},
      children: []
    };
  }

  const graph: ProvenanceGraph = {
    nodes: {},
    root: root,
    current: root
  };

  graph.nodes = addNode(graph.nodes, root);
  return graph;
}
