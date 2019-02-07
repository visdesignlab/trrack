import { Action } from "redux";
import { ActionsEnum } from "./ActionsEnum";
import { ProvenanceNode, NodeID } from "./Nodes";

export interface AddNodeAction extends Action {
  type: ActionsEnum.ADD_NODE;
  node: ProvenanceNode;
}

export type ProvenanceGraphAction = AddNodeAction | GotoAction;

export function createAddNodeAction(node: ProvenanceNode): AddNodeAction {
  return {
    type: ActionsEnum.ADD_NODE,
    node: node
  };
}

export interface GotoAction extends Action {
  type: ActionsEnum.GOTO_NODE;
  nodeid: NodeID;
}

export function createGotoAction(id: NodeID): GotoAction {
  return {
    type: ActionsEnum.GOTO_NODE,
    nodeid: id
  };
}
