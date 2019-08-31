import { combineReducers } from "redux";
import { nodeReducer } from "./NodeActions/Reducer";
import { currentReducer } from "./CurrentActions/Reducer";
import { rootReducer } from "./RootActions/Reducer";

export const Reducers = combineReducers({
  nodes: nodeReducer,
  current: currentReducer,
  root: rootReducer
});
