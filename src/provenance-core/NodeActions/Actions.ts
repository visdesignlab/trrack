import { Action } from "redux";
import { NodeActionsEnum } from "../ActionsEnum";
import { ProvenanceNode } from "../NodeInterfaces";

export type NodeAction<T> = AddNodeAction<T> | UpdateNewlyAddedNodeAction<T>;

export interface AddNodeAction<T> extends Action {
  type: NodeActionsEnum.ADD_NODE;
  node: ProvenanceNode<T>;
}

export interface UpdateNewlyAddedNodeAction<T> extends Action {
  type: NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE;
  node: ProvenanceNode<T>;
}
