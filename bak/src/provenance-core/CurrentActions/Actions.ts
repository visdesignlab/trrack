import { Action } from "redux";
import { CurrentActionsEnum } from "../ActionsEnum";
import { NodeID, ProvenanceNode } from "../NodeInterfaces";

export type CurrentAction<T> = AddChildToCurrentAction | ChangeCurrentAction<T>;

export interface AddChildToCurrentAction extends Action {
  type: CurrentActionsEnum.ADD_CHILD_TO_CURRENT;
  childNode: NodeID;
}

export interface ChangeCurrentAction<T> extends Action {
  type: CurrentActionsEnum.CHANGE_CURRENT;
  newCurrent: ProvenanceNode<T>;
}
