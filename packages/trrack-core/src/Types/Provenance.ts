/* eslint-disable no-unused-vars */
import { ApplyObject } from './Action';
import { Annotation, Artifact, NodeID, ProvenanceNode, RootNode } from './Nodes';
import { GlobalObserver, ObserverEffect, ObserverExpression } from './Observers';
import { ProvenanceGraph } from './ProvenanceGraph';
import { Deserializer, JsonValue, Serializer } from './Serializers';

export type ProvenanceOpts<T> = {
  loadFromUrl: boolean;
  firebaseConfig: any;
  _serializer: Serializer<T> | undefined;
  _deserializer: Deserializer<T> | undefined;
};

export type Provenance<T, S = void, A = void> = {
  /**
   * Returns the state type
   */
  state: T;

  /**
   * Returns the ProvenanceGraph object
   */
  graph: ProvenanceGraph<S, A>;

  /**
   * Returns the current Provenance Node object
   */
  current: ProvenanceNode<S, A>;

  /**
   * Returns the Root Node object
   */
  root: RootNode<S>;

  /**
   * Returns if using default serializer/deserializer
   */
  usingDefaultSerializer: boolean;

  /**
   * Applies the given action. Creates a new node based on the action,
   * sets that node to current, and calls observers accordingly.
   * @param action: applies an action
   */
  apply: (action: ApplyObject<T, S>, label?: string) => void;

  /**
   * Observer function which is called whenever any part of the state changes.
   * Also called when an artifact changes.
   * @param observer: Function which is called when the observer is triggered.
   */
  addGlobalObserver: (observer: GlobalObserver<S, A>) => void;

  /**
   * Adds an observer to the key which is returned from the ObserverExpression function.
   * Second parameter is a subscriber function which is called when the observer is triggered
   * For example
   * {
   *    selected: 'A',
   *    position:
   *      {
   *        A: 10
   *        B: 5
   *        C: 13
   *      }
   *   }
   *
   *   And you wanted an observer which was called whenever a node is selected, you would have
   *  addObserver((state) => state.selected, () => {doSomething}).
   *
   *   If you wanted an observer strictly for when the position of A changed, you would have
   *  addObserver((state) => state.position.A, () => {doSomething}).
   *
   */
  addObserver: <P>(expression: ObserverExpression<T, P>, effect: ObserverEffect<P>) => void;

  /**
   * Jumps to the node in the provenance graph with the given id.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   * @param id: NodeID of the node in the ProvenanceGraph to jump to.
   */
  goToNode: (id: NodeID) => void;

  /**
   * Adds an artifact to the given node
   * @param artifact: Artifact to be added
   * @param id: nodeID for which to add the artifact too. Defaults to current node.
   */
  addArtifact: (artifact: A, id?: NodeID) => void;
  /**
   * Adds an artifact to the given node
   * @param artifact: Artifact to be added
   * @param id: nodeID for which to add the artifact too. Defaults to current node.
   */
  addAnnotation: (annotation: string, id?: NodeID) => void;
  /**
   * Returns a list of all Artifacts for the given node
   * @param id: nodeID which we are retrieving artifacts from. Defaults to current node.
   */
  getAllArtifacts: (id?: NodeID) => Artifact<A>[];
  /**
   * Returns the most recent Artifact for the given node
   * @param id: nodeID which we are retrieving an artifact from. Defaults to current node.
   */
  getLatestArtifact: (id?: NodeID) => Artifact<A> | null;
  /**
   * Returns a list of all annotations for the given node
   * @param id: nodeID which we are retrieving annotations from. Defaults to current node.
   */
  getAllAnnotation: (id?: NodeID) => Annotation[];
  /**
   * Returns the most recent Artifact for the given node
   * @param id: nodeID which we are retrieving an annotations from. Defaults to current node.
   */
  getLatestAnnotation: (id?: NodeID) => Annotation | null;

  /**
   * Goes one step backwards in the provenance graph.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   */
  undo: () => void;

  /**
   * Goes one step backwards in the provenance graph. Equivalent to 'undo'
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   */
  goBackOneStep: () => void;

  /**
   * Goes forward one step in the provenance graph. If there are two or more chld nodes,
   * you may specify to go to the most recent or the oldest.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   * @param to: specify whether to jump to the latest or the oldest child. Defaults to oldest.
   */
  redo: (to?: 'latest' | 'oldest') => void;

  /**
   * Equivalent to redo
   * Goes forward one step in the provenance graph. If there are two or more chld nodes,
   * you may specify to go to the most recent or the oldest.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   * @param to: specify whether to jump to the latest or the oldest child. Defaults to oldest.
   */
  goForwardOneStep: (to?: 'latest' | 'oldest') => void;

  /**
   * Equivalent to undo, but while ignoring ephemeral nodes.
   * Goes one step backwards in the provenance graph, not including ephemeral nodes.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   */
  undoNonEphemeral: () => void;

  /**
   * Equivalent to undo, but while ignoring ephemeral nodes.
   * Goes one step backwards in the provenance graph, not including ephemeral nodes.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   */
  goBackToNonEphemeral: () => void;

  /**
   * Equivalent to redo, but while ignoring ephemeral nodes.
   * Goes forward one step in the provenance graph, not including ephemeral nodes.
   * If there are two or more chld nodes, you may specify to go to the most recent or the oldest.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   * @param to: specify whether to jump to the latest or the oldest child. Defaults to oldest.
   */
  redoNonEphemeral: (to?: 'latest' | 'oldest') => void;

  /**
   * Equivalent to redo, but while ignoring ephemeral nodes.
   * Goes forward one step in the provenance graph, not including ephemeral nodes.
   * If there are two or more chld nodes, you may specify to go to the most recent or the oldest.
   * Calls any observers for which their associated state has changed with the new node.
   * Also calls the global observer if any part of the state changed.
   * @param to: specify whether to jump to the latest or the oldest child. Defaults to oldest.
   */
  goForwardToNonEphemeral: (to?: 'latest' | 'oldest') => void;

  /**
   * Sets the bookmark of the node with the given ID. the bookmark is set to true or false,
   * equivalent on the second parameter.
   * @param id: NodeID for which we are editing
   * @param bookmark: boolean value for whether or not the bookmark is set.
   */
  setBookmark: (id: NodeID, bookmark: boolean) => void;

  /**
   * Gets the bookmark of the node with the given ID.
   * @param id: NodeID for the bookmark we are retrieving
   */
  getBookmark: (id: NodeID) => boolean;
  /**
   * Gets the bookmark of the node with the given ID.
   * @param id: NodeID for the bookmark we are retrieving
   */
  getAllBookmarks: () => NodeID[];
  /**
   * Returns to the root node.
   */
  reset: () => void;

  /**
   * Exports the current nodes state. Returns a compressed string
   * representing the JSON form of the current state
   */
  exportState: (partial?: boolean) => string;

  /**
   * Imports the given state. Decompresses the given string and creates a new node with that state.
   * @param importString: Decompressed string recieved from exportState function to import.
   */
  importState: (state: string | JsonValue) => void;
  /**
   * Imports an entire, non compressed provenance graph in JSON form.
   *
   * Replaces the current provenance graph with the new one.
   * @param graph: JSON string that represents the graph, or a pre built provenance graph object.
   */
  importProvenanceGraph: (graph: string | ProvenanceGraph<S, A>) => void;
  /**
   * Exports the entire provenance graph in JSON form. Not compressed.
   */
  exportProvenanceGraph: () => string;

  /**
   * Returns the state for the designated node.
   * @param node: ProvenanceNode object for which we are retrieving the state
   */
  getState: (node: ProvenanceNode<S, A> | NodeID) => T;
  config: ProvenanceOpts<T>;

  /**
   * Function to call when finished setting up observers. Allows for url state sharing easily.
   */
  done: () => void;
};
