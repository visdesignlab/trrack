import {
  createStore,
  combineReducers,
  Action,
  Store,
  Reducer,
  AnyAction
} from "redux";
import {
  createNewGraph,
  ProvenanceGraph,
  Nodes,
  CurrentNode
} from "./provenance-core/IProvenanceGraph";
import { ProvenanceNode, NodeID, RootNode } from "./provenance-core/Nodes";
import {
  createAddNodeAction,
  AddNodeAction,
  ProvenanceGraphAction
} from "./provenance-core/Actions";
import { ActionsEnum } from "./provenance-core/ActionsEnum";
import { deepCopy } from "./utils/utils";

console.clear();

const nodeReducer: Reducer<Nodes> = (
  nodes: Nodes = {},
  action: AddNodeAction
) => {
  switch (action.type) {
    case ActionsEnum.ADD_NODE:
      return addNode(nodes, action.node);
    default:
      return nodes;
  }
};

const currentReducer: Reducer<CurrentNode> = (
  current: CurrentNode = {} as any,
  action: AnyAction
) => {
  return current;
};

const rootReducer: Reducer<RootNode> = (
  root: RootNode = {} as any,
  action: AnyAction
) => {
  console.log("root", root);
  return root;
};

const graphReducers: Reducer<ProvenanceGraph> = combineReducers<
  ProvenanceGraph
>({
  nodes: nodeReducer,
  current: currentReducer,
  root: rootReducer
});

export function configureStore(state: ProvenanceGraph): Store<ProvenanceGraph> {
  return createStore<ProvenanceGraph, null, null, null>(graphReducers);
}

// function addNewNodeToGraph(graph: ProvenanceGraph, node: ProvenanceNode) {
//   return JSON.parse(JSON.stringify(graph));
// }

// function gotoNode(graph: ProvenanceGraph, id: NodeID) {
//   return JSON.parse(JSON.stringify(graph));
// }

const graph = configureStore(createNewGraph());

graph.dispatch<AddNodeAction>(createAddNodeAction({ a: "a" } as any));

console.log(graph.getState());

function addNode(nodes: Nodes, node: ProvenanceNode): Nodes {
  if (nodes[node.id]) throw new Error("Node already exists");
  let newNodes = deepCopy(nodes);
  newNodes[node.id] = node;
  return newNodes;
}
