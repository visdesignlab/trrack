import { ProvenanceNode } from "../NodeInterfaces";
import { AddNodeAction, UpdateNewlyAddedNodeAction } from "./Actions";
import { NodeActionsEnum } from "../ActionsEnum";

export function createAddNodeAction(node: ProvenanceNode): AddNodeAction {
  return {
    type: NodeActionsEnum.ADD_NODE,
    node: node
  };
}

export function createUpdateNewlyAddedNodeAction(
  node: ProvenanceNode
): UpdateNewlyAddedNodeAction {
  return {
    type: NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE,
    node: node
  };
}
