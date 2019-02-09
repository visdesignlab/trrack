import { Action } from "redux";
import { CurrentActionsEnum } from "../ActionsEnum";
import { NodeID, ProvenanceNode } from "../NodeInterfaces";

export type CurrentAction = AddChildToCurrentAction | ChangeCurrentAction;

export interface AddChildToCurrentAction extends Action {
  type: CurrentActionsEnum.ADD_CHILD_TO_CURRENT;
  childNode: NodeID;
}

export interface ChangeCurrentAction extends Action {
  type: CurrentActionsEnum.CHANGE_CURRENT;
  newCurrent: ProvenanceNode;
}
