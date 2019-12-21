import { ProvenanceNode } from "../NodeInterfaces";
import { AddNodeAction, UpdateNewlyAddedNodeAction } from "./Actions";
import { NodeActionsEnum } from "../ActionsEnum";

export function createAddNodeAction<T>(
  node: ProvenanceNode<T>
): AddNodeAction<T> {
  return {
    type: NodeActionsEnum.ADD_NODE,
    node: node
  };
}

export function createUpdateNewlyAddedNodeAction<T>(
  node: ProvenanceNode<T>
): UpdateNewlyAddedNodeAction<T> {
  return {
    type: NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE,
    node: node
  };
}
