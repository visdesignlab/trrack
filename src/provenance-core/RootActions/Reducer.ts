import { RootNode } from "../NodeInterfaces";
import { Reducer, AnyAction } from "redux";

export const rootReducer: Reducer<RootNode> = (
  root: RootNode = {} as any,
  action: AnyAction
) => {
  return root;
};
