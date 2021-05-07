/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import { action, toJS } from 'mobx';
import { ActionFunction, ActionObject, ActionSaveStateMode, ActionType } from '../Types/Action';
import { Meta } from '../Types/Nodes';

/**
 *
 * @template T State of the application
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 *
 * @param func Defines the function which will be executed on provenance apply
 *
 */

// TODO:: Switch Args and S here.
export default function createAction<T, Args extends unknown[] = unknown[], S = void>(
  func: ActionFunction<T, Args>,
): ActionObject<T, S, Args> {
  let _label: string | undefined;
  let _actionType: ActionType = 'Regular';
  let _stateSaveMode: ActionSaveStateMode = 'Diff';
  let _eventType: S;
  let _meta: Meta = {};

  const actionObject: ActionObject<T, S, Args> = (...args: Args) => {
    return {
      apply: action((state: T, label?: string) => {
        if (!_label) throw new Error('Please specify a default label when you create the action');

        if (!label) label = _label;

        func(state, ...args);
        return {
          state: toJS(state),
          label: label,
          stateSaveMode: _stateSaveMode,
          actionType: _actionType,
          eventType: _eventType,
          meta: _meta,
        };
      }),
    };
  };

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
