import { ArgArray } from '../provenance-graph';
import { ActionFunction } from './types';

export function initializeActionFunctionRegistry() {
  const afr: { [key: string]: ActionFunction } = {};

  return {
    registry: afr,
    register<Args extends ArgArray, Return = void>(
      registryName: string,
      func: ActionFunction<Args, Return>
    ) {
      afr[registryName] = func;
    },
  };
}

export type ActionFunctionRegistry = ReturnType<
  typeof initializeActionFunctionRegistry
>;
