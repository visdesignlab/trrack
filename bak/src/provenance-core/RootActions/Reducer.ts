import { RootNode } from "../NodeInterfaces";
import { AnyAction } from "redux";

export function rootReducer<T>(
  root: RootNode<T> = {} as any,
  action: AnyAction
) {
  return root;
}
