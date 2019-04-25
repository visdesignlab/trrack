import { Action } from "redux";

export type GenericAction<T> = DoAction<T> | UndoAction<T>;

export interface DoAction<T> extends Action {
  readonly type: string;
  args: T;
}


export interface UndoAction<T> extends Action {
  readonly type: string;
  args: T;
}

export interface ReversibleAction<D, U> {
  readonly type: string;
  readonly doAction: DoAction<D>;
  readonly undoAction: UndoAction<U>;
}

export interface ResetAction<T> extends Action {
  readonly type: string;
  readonly doAction: any;
  readonly undoAction: any;
}

export function ReversibleActionCreator<D, U>(
  type: string,
  doArgs: D,
  undoArgs: U
): ReversibleAction<D, U> {
  return {
    type: type,
    doAction: {
      type: `DO_${type}`,
      args: doArgs
    },
    undoAction: {
      type: `UNDO_${type}`,
      args: undoArgs
    }
  };
}

export function ResetActionCreator<T>(
  type: string,
  doArgs: T
): ResetAction<T> {
  return {
    type: type,
    doAction: {
      type: type,
      args: doArgs
    },
    undoAction: {
      type: type,
      args: doArgs
    }
  };
}
