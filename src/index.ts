import { createStore, combineReducers, Store, Reducer } from "redux";
import {
  ProvenanceGraph,
  createNewGraph
} from "./provenance-core/IProvenanceGraph";
import { NodeAction, createAddNodeAction } from "./provenance-core/NodeActions";
import {
  nodeReducer,
  currentReducer,
  rootReducer
} from "./provenance-core/Reducers";

console.clear();

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

const graph = configureStore(createNewGraph());

graph.dispatch<NodeAction>(createAddNodeAction({ a: "a" } as any));

console.log(graph.getState());
