/* eslint-disable no-underscore-dangle */
import { action, toJS } from 'mobx';
import {
  ActionFunction,
  ActionObject,
  ActionType,
  ActionSaveStateMode,
} from '../Types/Action';
import { Meta } from '../Types/Nodes';

export default function createAction<T, S>(
  func: ActionFunction<T>,
): ActionObject<T, S> {
  let _label: string | undefined;
  let _args: any[] = [];
  let _actionType: ActionType = 'Regular';
  let _stateSaveMode: ActionSaveStateMode = 'Diff';
  let _eventType: S;
  let _meta: Meta = {};

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
    saveStateMode(mode: ActionSaveStateMode) {
      _stateSaveMode = mode;
      return this;
    },
    setEventType(evtType: S) {
      _eventType = evtType;
      return this;
    },
    setMetaData(m: Meta) {
      _meta = m;
      return this;
    },
    apply: action((state: T) => {
      if (!_label) throw new Error('Please specify a label for the action');
      func(state, ..._args);
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
}
