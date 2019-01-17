import { ActionFunctionWithThis, ActionFunction } from "./Actions";
import { IActionFunctionRegistry } from "./IActionFunctionRegistry";

export class ActionFunctionRegistry implements IActionFunctionRegistry {
  private functionRegistry: { [key: string]: ActionFunctionWithThis } = {};

  register(name: string, func: ActionFunction, thisArg?: any) {
    if (this.functionRegistry[name])
      throw new Error(`${name} function already registered`);
    this.functionRegistry[name] = { func: func, thisArg: thisArg };
  }
  getFunctionByName(name: string) {
    if (!this.functionRegistry[name])
      throw new Error("Function not registered");
    return this.functionRegistry[name];
  }
  isPresent(name: string): boolean {
    if (this.functionRegistry[name]) return true;
    return false;
  }
}
