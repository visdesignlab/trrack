import { CurrentActionsEnum } from "../ActionsEnum";
import { ProvenanceNode, NodeID, CurrentNode } from "../NodeInterfaces";
import { CurrentAction } from "./Actions";

export function currentReducer<T>(
  current: CurrentNode<T> = {} as any,
  action: CurrentAction<T>
) {
  switch (action.type) {
    case CurrentActionsEnum.ADD_CHILD_TO_CURRENT:
      return addChildToCurrent(current, action.childNode);
      break;
    case CurrentActionsEnum.CHANGE_CURRENT:
      return action.newCurrent;
    default:
      return current;
  }
}

export function addChildToCurrent<T>(
  current: ProvenanceNode<T>,
  child: NodeID
) {
  const curr = Object.assign({}, current);
  curr.children.push(child);
  return curr;
}
