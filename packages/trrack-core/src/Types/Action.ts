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
export type ActionFunction<T, Args extends any[]> = (state: T, ...args: Args) => void;

export type ActionReturnType<T, S> = {
  state: T;
  label: string;
  stateSaveMode: ActionSaveStateMode;
  actionType: ActionType;
  eventType: S;
  meta: Meta;
};

export type ApplyObject<T, S> = {
  apply: (state: T, label?: string) => ActionReturnType<T, S>;
};

export type ActionObject<T, S, Args extends any[]> = {
  /**
   * Edits the label associated with this action
   */
  setLabel: (label: string) => ActionObject<T, S, Args>;
  /**
   * Changes the action type to either "Regular" or "Ephemeral"
   * Ephemeral actions are skipped with the ephemeral undo/redo,
   * and appear clustered in trrackvis
   */
  setActionType: (actionType: ActionType) => ActionObject<T, S, Args>;
  /**
   * Manually changes the state save for this node to either "Diff" or "Complete"
   * Typically better to let trrack decide how to store your node
   */
  saveStateMode: (mode: ActionSaveStateMode) => ActionObject<T, S, Args>;
  /**
   * Manually changes the state save for this action to either "Diff" or "Complete"
   * Typically better to let trrack decide how to store your node
   */
  setEventType: (eventType: S) => ActionObject<T, S, Args>;
  /**
   * Adds custom metadata to the metadata associated with this action
   * See Nodes.ts for more documentation on the NodeMetadata type.
   */
  setMetaData: (metadata: Meta) => ActionObject<T, S, Args>;
} & ((...args: Args) => ApplyObject<T, S>);
