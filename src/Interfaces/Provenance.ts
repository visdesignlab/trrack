import { ProvenanceGraph } from './ProvenanceGraph';
import { Action } from './ActionObject';

import { NodeID, NodeMetadata, Artifacts, RootNode, ProvenanceNode, Extra } from './NodeInterfaces';

/**
 * Function type passed to observers. Will be called when an observer is triggered and will pass the new state as the parameter.
 */
export type SubscriberFunction<T> = (state?: T) => void;

export type ArtifactSubscriberFunction<A> = (extra: Extra<A>[]) => void;

/**
 * Function passed to addAction or applyAction which alters and returns the desired state.
 * Always has the current state as the first parameter.
 * Has optional additional parameters which can be passed through the args parameter in applyAction,
 * or by using addArgs in the Action object.
 */
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
   * @param label: Label to be associated with this action.
   * @param action: ActionFunction type function used to change the state. See ActionFunction documentation above.
   */
  addAction: (label: string, action: ActionFunction<T>) => Action<T, S, A>;

  /**
   * OUTDATED
   * Old way to apply an action. addAction combined with the functions in Action.ts replace this.
   */
  applyAction: (
    label: string,
    action: ActionFunction<T>,
    args?: any[],
    metadata?: NodeMetadata<S>,
    artifacts?: Artifacts<A>,
    eventType?: S,
    complex?: boolean,
    ephemeral?: boolean
  ) => T;

  /*
   * Adds an observer to the key in the state Object which propPath leads to.
   * For example, if your state looked like
   {
    selected: 'A',
    position:
      {
        A: 10
        B: 5
        C: 13
      }
   }

   And you wanted an observer which was called whenever a node is selected, your propPath would be
   ['selected'].

   If you wanted an observer strictly for when the position of A changed, your propPath would be
   ['position', 'A']

   * Second parameter is associated subscriber function which is called when the observer is triggered
   */
  addObserver: (propPath: string[], func: SubscriberFunction<T>) => void;

  addArtifactObserver: (func: ArtifactSubscriberFunction<A>) => void;

  /*
   * Global observer which is called whenever the state of the application changes whatsoever.
   */
  addGlobalObserver: (func: SubscriberFunction<T>) => void;

  addExtraToNodeArtifact: (id: NodeID, extra: A) => void;
  getExtraFromArtifact: (id: NodeID) => Extra<A>[];

  addAnnotationToNode: (id: NodeID, annotation: string) => void;
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

  goBackToNonEphemeral: () => void;
  goForwardToNonEphemeral: () => void;

  /**
   * Returns to the root node.
   */
  reset: () => void;

  /**
   *
   */
  done: () => void;

  importLinearStates: (states: T[], labels?: string[], metadata?: NodeMetadata<S>[]) => void;

  /*
   * Exports the current nodes state. Returns a compressed string representing the JSON form of the current state
   */
  exportState: (partial?: boolean) => string;

  /*
   * Imports the given state. Decompresses the given string and creates a new node with that state.
   * @param importString: Decompressed string recieved from exportState function to import.
   */
  importState: (importString: string) => void;

  /*
   * Exports the entire provenance graph in JSON form. Not compressed.
   */
  exportProvenanceGraph: () => string;

  getDiffFromNode: (id: NodeID) => any[] | undefined;

  /*
   * Imports an entire, non compressed provenance graph in JSON form. Replaces the current provenance graph with the new one.
   */
  importProvenanceGraph: (importString: string) => void;
}
