import { ProvenanceGraph } from './ProvenanceGraph';
import { Action } from './ActionObject';

import { NodeID, NodeMetadata, Artifacts, RootNode, ProvenanceNode, Extra } from './NodeInterfaces';

export type SubscriberFunction<T> = (state?: T) => void;

export type ArtifactSubscriberFunction<A> = (extra: Extra<A>[]) => void;

export type ActionFunction<T> = (currentState: T, ...args: any[]) => T;

export type ExportedState<T> = Partial<T>;

export default interface Provenance<T, S, A> {
  /*
   * Returns the ProvenanceGraph object
   */
  graph: () => ProvenanceGraph<T, S, A>;

  /*
   * Returns the current Provenance Node object
   */
  current: () => ProvenanceNode<T, S, A>;

  /*
   * Returns the Root Node object
   */
  root: () => RootNode<T, S>;

  /*
   * Function for creating new nodes in the graph.
   * Creates and returns an Action object which can be further customized before applying the action, which created a new node.
   * For further documentation on the Action object, see Action.ts
   * @param label
   */
  addAction: (label: string, action: ActionFunction<T>) => Action<T, S, A>;

  applyAction: (
    label: string,
    action: ActionFunction<T>,
    args?: any[],
    metadata?: NodeMetadata<S>,
    artifacts?: Artifacts<A>,
    eventType?: S,
    complex?: boolean
  ) => T;

  addObserver: (propPath: string[], func: SubscriberFunction<T>) => void;
  addArtifactObserver: (func: ArtifactSubscriberFunction<A>) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;

  addExtraToNodeArtifact: (id: NodeID, extra: A) => void;
  getExtraFromArtifact: (id: NodeID) => Extra<A>[];

  /*
   * Jumps to the node in the provenance graph with the given id.
   * Calls the Global Observer if there is one. Also calls any observers for which their associated state has changed with the new node.
   * @param id: NodeID of the node in the ProvenanceGraph to jump to.
   */
  goToNode: (id: NodeID) => void;

  /*
   * Goes one step backwards in the provenance graph. Equivalent to 'undo'
   * Calls the Global Observer if there is one. Also calls any observers for which their associated state has changed with the new node.
   */
  goBackOneStep: () => void;

  /*
   * Goes N step backwards in the provenance graph.
   * Calls the Global Observer if there is one. Also calls any observers for which their associated state has changed with the new node.
   * @param n: number of steps to traverse backwards in the provenance graph.
   */
  goBackNSteps: (n: number) => void;

  /*
   * Goes one step forward in the provenance graph. Equivalent to 'redo'
   * Calls the Global Observer if there is one. Also calls any observers for which their associated state has changed with the new node.
   */
  goForwardOneStep: () => void;

  reset: () => void;
  done: () => void;

  exportState: (partial?: boolean) => string;
  importState: (importString: string) => void;

  exportProvenanceGraph: () => string;
  importProvenanceGraph: (importString: string) => void;
}
