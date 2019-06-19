import { generateTimeStamp, generateUUID } from "../utils/utils";
import { RootNode, CurrentNode, Nodes } from "./NodeInterfaces";
import { addNode } from "./NodeActions/Reducer";

export interface ProvenanceGraph<T> {
  nodes: Nodes<T>;
  current: CurrentNode<T>;
  root: RootNode<T>;
}

export function createNewGraph<T>(_root?: RootNode<T>): ProvenanceGraph<T> {
  let root: RootNode<T> = undefined;
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

  const graph: ProvenanceGraph<T> = {
    nodes: {},
    root: root,
    current: root
  };

  graph.nodes = addNode(graph.nodes, root);
  return graph;
}

export function createNewGraphWithoutRedux<T>(
  initState: T
): ProvenanceGraph<T> {
  let root: RootNode<T> = {
    id: generateUUID(),
    label: "Root",
    metadata: {
      createdOn: generateTimeStamp()
    },
    artifacts: {},
    children: [],
    state: initState
  };

  const graph: ProvenanceGraph<T> = {
    nodes: {},
    root: root,
    current: root
  };

  graph.nodes = addNode(graph.nodes, root);
  return graph;
}
