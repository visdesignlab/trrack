import { generateTimeStamp, generateUUID } from "../utils/utils";
import { RootNode, CurrentNode, Nodes } from "./NodeInterfaces";
import { addNode } from "./NodeActions/Reducer";
import { Store } from "redux";

export interface ProvenanceGraph<T> {
  nodes: Nodes<T>;
  current: CurrentNode<T>;
  root: RootNode<T>;
}

export function createNewGraphRedux<T>(
  application: Store<T>
): ProvenanceGraph<T> {
  let root: RootNode<T> = undefined;

  root = {
    id: generateUUID(),
    label: "Root",
    metadata: {
      createdOn: generateTimeStamp()
    },
    artifacts: {},
    children: [],
    state: application.getState()
  };

  const graph: ProvenanceGraph<T> = {
    nodes: {},
    root: root,
    current: root
  };

  graph.nodes = addNode(graph.nodes, root);
  return graph;
}

export function createNewGraph<T>(initState: T): ProvenanceGraph<T> {
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
