/* eslint-disable no-unused-vars */
import {
  Annotation,
  Artifact,
  NodeID,
  ProvenanceNode,
  RootNode,
} from './Nodes';
import { ProvenanceGraph } from './ProvenanceGraph';
import { ApplyObject } from './Action';
import {
  GlobalObserver,
  ObserverExpression,
  ObserverEffect,
} from './Observers';

export type ProvenanceOpts = {
  loadFromUrl: boolean;
  firebaseConfig: any;
};

export type Provenance<T, S = void, A = void> = {
  state: T;
  graph: ProvenanceGraph<T, S, A>;
  current: ProvenanceNode<T, S, A>;
  root: RootNode<T, S>;
  apply: (action: ApplyObject<T, S>) => void;
  addGlobalObserver: (observer: GlobalObserver<T, S, A>) => void;
  addObserver: (
    expression: ObserverExpression<T>,
    effect: ObserverEffect<T>
  ) => void;
  goToNode: (id: NodeID) => void;
  addArtifact: (artifact: A, id?: NodeID) => void;
  addAnnotation: (annotation: string, id?: NodeID) => void;
  getAllArtifacts: (id?: NodeID) => Artifact<A>[];
  getLatestArtifact: (id?: NodeID) => Artifact<A> | null;
  getAllAnnotation: (id?: NodeID) => Annotation[];
  getLatestAnnotation: (id?: NodeID) => Annotation | null;
  undo: () => void;
  goBackOneStep: () => void;
  redo: (to?: 'latest' | 'oldest') => void;
  goForwardOneStep: (to?: 'latest' | 'oldest') => void;
  undoNonEphemeral: () => void;
  goBackToNonEphemeral: () => void;
  redoNonEphemeral: (to?: 'latest' | 'oldest') => void;
  goForwardToNonEphemeral: (to?: 'latest' | 'oldest') => void;
  setBookmark: (id: NodeID, bookmark: boolean) => void;
  getBookmark: (id: NodeID) => boolean;
  reset: () => void;
  exportState: (partial?: boolean) => string;
  importState: (state: string | Partial<T>) => void;
  importProvenanceGraph: (graph: string | ProvenanceGraph<T, S, A>) => void;
  exportProvenanceGraph: () => string;
  getState: (node: ProvenanceNode<T, S, A>) => T;
  config: ProvenanceOpts;
  done: () => void;
};
