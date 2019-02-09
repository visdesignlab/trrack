import { Reducer } from "redux";
import { CurrentActionsEnum } from "../ActionsEnum";
import { ProvenanceNode, NodeID, CurrentNode } from "../NodeInterfaces";
import { CurrentAction } from "./Actions";

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
