import { Action } from "redux";

export interface RecordableReduxAction extends Action {
  readonly type: string;
  label: string;
  args: unknown;
}

export function recordableReduxActionCreator(
  label: string,
  type: string,
  args: unknown
): RecordableReduxAction {
  return {
    type,
    label,
    args
  };
}
