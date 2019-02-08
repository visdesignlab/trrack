import { ProvenanceNode, RootNode } from "./Nodes";
import { generateUUID, generateTimeStamp } from "../utils/utils";
import { addNode } from "./NodeActions";

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

  graph.nodes = addNode(graph.nodes, root);
  return graph;
}
