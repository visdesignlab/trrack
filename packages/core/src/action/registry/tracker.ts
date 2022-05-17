import { Action } from '../types';
import { ActionFunctionRegistry } from './types';

export function initializeActionFunctionRegistryTracker() {
  const reg: ActionFunctionRegistry = {};

  return {
    registry() {
      return reg;
    },
    register(
      actionName: string,
      doableAction: Function,
      undoableAction: Function,
      thisArg: any = null
    ) {
      if (reg[actionName])
        throw new Error(
          `Action ${actionName} already registered. Please check your code for duplicate action registration`
        );

      reg[actionName] = {
        thisArg,
        doableAction,
        undoableAction,
      };
    },
    applyDo(action: Action) {
      if (!reg[action.registry_name])
        throw new Error(`Action ${action.registry_name} not registered.`);

      const { thisArg, doableAction } = reg[action.registry_name];

      return doableAction.apply(thisArg, action.do.args);
    },
    applyUndo(action: Action) {
      if (!reg[action.registry_name])
        throw new Error(`Action ${action.registry_name} not registered.`);

      const { thisArg, undoableAction } = reg[action.registry_name];

      return undoableAction.apply(thisArg, action.undo.args);
    },
  };
}

export type ActionFunctionRegistryTracker = ReturnType<
  typeof initializeActionFunctionRegistryTracker
>;
