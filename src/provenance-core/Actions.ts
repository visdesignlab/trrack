import { ActionFunctionWithThis } from "./Actions";
import { Handler } from "./Handler";
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

export type ActionTemplate = {
  func: Handler;
  thisArgs: any;
};

export type RegisterActionTemplate = {
  name: string;
  do: ActionTemplate;
  undo?: ActionTemplate;
};

export type ApplyAction = {
  name: string;
  doArgs: any[];
  undoArgs: any[];
};
