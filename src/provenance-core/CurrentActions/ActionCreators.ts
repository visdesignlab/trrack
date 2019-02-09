import { NodeID, ProvenanceNode } from "../NodeInterfaces";
import { AddChildToCurrentAction, ChangeCurrentAction } from "./Actions";
import { CurrentActionsEnum } from "../ActionsEnum";

export function createAddChildToCurrentAction(
  childNode: NodeID
): AddChildToCurrentAction {
  return {
    type: CurrentActionsEnum.ADD_CHILD_TO_CURRENT,
    childNode: childNode
  };
}

export function createChangeCurrentAction(
  newCurrent: ProvenanceNode
): ChangeCurrentAction {
  return {
    type: CurrentActionsEnum.CHANGE_CURRENT,
    newCurrent: newCurrent
  };
}
