import { Reducer } from "redux";
import { Nodes, addNode, CurrentNode } from "./IProvenanceGraph";
import { NodeAction } from "./NodeActions";
import { ActionsEnum } from "./ActionsEnum";
import { AnyAction } from "redux";
import { RootNode } from "./Nodes";

export const nodeReducer: Reducer<Nodes> = (
  nodes: Nodes = {},
  action: NodeAction
) => {
  switch (action.type) {
    case ActionsEnum.ADD_NODE:
      return addNode(nodes, action.node);
    default:
      return nodes;
  }
};

export const currentReducer: Reducer<CurrentNode> = (
  current: CurrentNode = {} as any,
  action: AnyAction
) => {
  return current;
};

export const rootReducer: Reducer<RootNode> = (
  root: RootNode = {} as any,
  action: AnyAction
) => {
  return root;
};
