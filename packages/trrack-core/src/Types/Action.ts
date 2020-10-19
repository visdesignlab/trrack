/* eslint-disable no-unused-vars */

import { Meta } from './Nodes';

/**
 *
 * __Ephemeral__ for actions which are shortlived. e.g. hovering
 *
 * __Regular__ for all you other actions.
 *
 */
export type ActionType = 'Ephemeral' | 'Regular';

/**
 *
 * __Complete__ for saving the entire state
 *
 * __Diff__ for using diff algorithm
 *
 */
export type ActionSaveStateMode = 'Complete' | 'Diff';

/**
 * @typeParam T Type of application state
 * @typeParam Args Represents the types for the arguments
 *
 * @param T Application state
 */
export type ActionFunction<T, Args extends any[]> = (
  state: T,
  ...args: Args
) => void;

export type ActionReturnType<T, S> = {
  state: T;
  label: string;
  stateSaveMode: ActionSaveStateMode;
  actionType: ActionType;
  eventType: S;
  meta: Meta;
};

export type ApplyObject<T, S> = {
  apply: (state: T) => ActionReturnType<T, S>;
};

export type ActionObject<T, S, Args extends any[]> = {
  setLabel: (label: string) => ActionObject<T, S, Args>;
  setActionType: (actionType: ActionType) => ActionObject<T, S, Args>;
  saveStateMode: (mode: ActionSaveStateMode) => ActionObject<T, S, Args>;
  setEventType: (eventType: S) => ActionObject<T, S, Args>;
  setMetaData: (metadata: Meta) => ActionObject<T, S, Args>;
} & ((...args: Args) => ApplyObject<T, S>);