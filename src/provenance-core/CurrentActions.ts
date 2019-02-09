import { Action, Reducer } from "redux";
import { CurrentActionsEnum } from "./ActionsEnum";
import { StateNode, ProvenanceNode, NodeID } from "./Nodes";
import { CurrentNode } from "./ProvenanceGraph";

export type CurrentAction = AddChildToCurrentAction | ChangeCurrentAction;

export interface AddChildToCurrentAction extends Action {
  type: CurrentActionsEnum.ADD_CHILD_TO_CURRENT;
  childNode: NodeID;
}

export interface ChangeCurrentAction extends Action {
  type: CurrentActionsEnum.CHANGE_CURRENT;
  newCurrent: ProvenanceNode;
}

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

export const currentReducer: Reducer<CurrentNode> = (
  current: CurrentNode = {} as any,
  action: CurrentAction
) => {
  switch (action.type) {
    case CurrentActionsEnum.ADD_CHILD_TO_CURRENT:
      return addChildToCurrent(current, action.childNode);
      break;
    case CurrentActionsEnum.CHANGE_CURRENT:
      return action.newCurrent;
    default:
      return current;
  }
};

export function addChildToCurrent(current: ProvenanceNode, child: NodeID) {
  const curr = Object.assign({}, current);
  curr.children.push(child);
  return curr;
}
