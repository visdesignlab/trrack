import { ActionFunctionWithThis } from "./Actions";
export type Action = IrreversibleAction | ReversibleAction;

export type ActionMetadata = {
  tags?: string[];
  userIntent?: string;
  [key: string]: any;
};

export type IrreversibleAction = {
  metadata?: ActionMetadata;
  do: string;
  doArgs: any[];
};

export type ReversibleAction = IrreversibleAction & {
  undo: string;
  undoArgs: any[];
};

export type ActionFunction = (...args: any[]) => Promise<any>;

export type ActionFunctionWithThis = {
  func: ActionFunction;
  thisArg: any;
};

export function isReversibleAction(action: Action): action is ReversibleAction {
  return "undo" in action;
}
