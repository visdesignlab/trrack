import { Action } from "redux";
import { NodeActionsEnum } from "../ActionsEnum";
import { ProvenanceNode } from "../NodeInterfaces";

export type NodeAction = AddNodeAction | UpdateNewlyAddedNodeAction;

export interface AddNodeAction extends Action {
  type: NodeActionsEnum.ADD_NODE;
  node: ProvenanceNode;
}

export interface UpdateNewlyAddedNodeAction extends Action {
  type: NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE;
  node: ProvenanceNode;
}
