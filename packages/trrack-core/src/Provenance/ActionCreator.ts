import { action, toJS } from 'mobx';
import { ActionFunction, ActionObject, ActionType } from '../Interfaces/Action';

export default function createAction<T>(
  func: ActionFunction<T>,
): ActionObject<T> {
  let _label: string | undefined;
  let _args: any[] = [];
  let _actionType: ActionType = 'Regular';

  return {
    setLabel(label: string) {
      _label = label;
      return this;
    },
    setArgs(args: any[]) {
      _args = args;
      return this;
    },
    setActionType(actionType: ActionType) {
      _actionType = actionType;
      return this;
    },
    apply: action((state: T) => {
      if (!_label) throw new Error('Please specify a label for the action');
      const st = func(state, ..._args);
      return {
        state: toJS(st),
        label: _label,
        complex: false,
        actionType: _actionType,
      };
    }),
  };
}
