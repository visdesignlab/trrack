import { combineReducers, Reducer } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import { nodeReducer } from "./NodeActions/Reducer";
import { currentReducer } from "./CurrentActions/Reducer";
import { rootReducer } from "./RootActions/Reducer";

export const Reducers = combineReducers({
  nodes: nodeReducer,
  current: currentReducer,
  root: rootReducer
});
