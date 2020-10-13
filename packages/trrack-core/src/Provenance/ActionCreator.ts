/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import { action, toJS } from 'mobx';
import {
  ActionFunction,
  ActionObject,
  ActionType,
  ActionSaveStateMode,
} from '../Types/Action';
import { Meta } from '../Types/Nodes';

export default function createAction<T, Args extends any[] = any[], S = void>(
  func: ActionFunction<T, Args>,
): ActionObject<T, S, Args> {
  let _label: string | undefined;
  let _actionType: ActionType = 'Regular';
  let _stateSaveMode: ActionSaveStateMode = 'Diff';
  let _eventType: S;
  let _meta: Meta = {};

  const actionObject: ActionObject<T, S, Args> = function (args: Args) {
    return {
      apply: action((state: T) => {
        if (!_label) throw new Error('Please specify a label for the action');
        func(state, ...([args] as any));
        return {
          state: toJS(state),
          label: _label,
          stateSaveMode: _stateSaveMode,
          actionType: _actionType,
          eventType: _eventType,
          meta: _meta,
        };
      }),
    };
  } as any;

  actionObject.setLabel = function (label: string) {
    _label = label;
    return this;
  };

  actionObject.setActionType = function (actionType: ActionType) {
    _actionType = actionType;
    return this;
  };

  actionObject.saveStateMode = function (mode: ActionSaveStateMode) {
    _stateSaveMode = mode;
    return this;
  };

  actionObject.setEventType = function (evtType: S) {
    _eventType = evtType;
    return this;
  };

  actionObject.setMetaData = function (m: Meta) {
    _meta = m;
    return this;
  };

  return actionObject;
}
