import { ProvenanceNode, RootNode } from "./Nodes";
import { generateUUID, generateTimeStamp, deepCopy } from "../utils/utils";

export type Nodes = { [key: string]: ProvenanceNode };
export type CurrentNode = ProvenanceNode;

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

  addNode(graph.nodes, root);
  return graph;
}

export function addNode(nodes: Nodes, node: ProvenanceNode): Nodes {
  if (nodes[node.id]) throw new Error("Node already exists");
  let newNodes = deepCopy(nodes);
  newNodes[node.id] = node;
  return newNodes;
}
