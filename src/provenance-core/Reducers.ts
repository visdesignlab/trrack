import { Reducer, combineReducers } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import { nodeReducer } from "./NodeActions/Reducer";
import { currentReducer } from "./CurrentActions/Reducer";
import { rootReducer } from "./RootActions/Reducer";

export const Reducers: Reducer<ProvenanceGraph> = combineReducers<
  ProvenanceGraph
>({
  nodes: nodeReducer,
  current: currentReducer,
  root: rootReducer
});
