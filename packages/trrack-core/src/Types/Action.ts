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

export type ActionSaveStateMode = 'Complete' | 'Diff';

export type ActionFunction<T> = (state: T, ...args: any[]) => void;

export type ActionReturnType<T, S> = {
  state: T;
  label: string;
  stateSaveMode: ActionSaveStateMode;
  actionType: ActionType;
  eventType: S;
  meta: Meta;
};

export type ActionObject<T, S> = {
  setLabel: (label: string) => ActionObject<T, S>;
  setArgs: (args: any[]) => ActionObject<T, S>;
  setActionType: (actionType: ActionType) => ActionObject<T, S>;
  saveStateMode: (mode: ActionSaveStateMode) => ActionObject<T, S>;
  setEventType: (eventType: S) => ActionObject<T, S>;
  setMetaData: (metadata: Meta) => ActionObject<T, S>;
  apply: (state: T, ...args: any[]) => ActionReturnType<T, S>;
};
