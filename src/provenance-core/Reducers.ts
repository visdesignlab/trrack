import { Reducer, combineReducers } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import { AnyAction } from "redux";
import { RootNode } from "./Nodes";
import { nodeReducer } from "./NodeActions";
import { currentReducer } from "./CurrentActions";

export const rootReducer: Reducer<RootNode> = (
  root: RootNode = {} as any,
  action: AnyAction
) => {
  action.type;
  return root;
};

export const Reducers: Reducer<ProvenanceGraph> = combineReducers<
  ProvenanceGraph
>({
  nodes: nodeReducer,
  current: currentReducer,
  root: rootReducer
});
