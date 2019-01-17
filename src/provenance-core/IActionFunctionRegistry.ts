import { ActionFunction, ActionFunctionWithThis } from "./Actions";

export interface IActionFunctionRegistry {
  register(name: string, func: ActionFunction, thisArg?: any): void;
  getFunctionByName(name: string): ActionFunctionWithThis;
}
