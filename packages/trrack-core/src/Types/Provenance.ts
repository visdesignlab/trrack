/* eslint-disable no-unused-vars */
import { NodeID, ProvenanceNode, RootNode } from './Nodes';
import { ProvenanceGraph } from './ProvenanceGraph';
import { ActionObject } from './Action';
import {
  GlobalObserver,
  ObserverExpression,
  ObserverEffect,
} from './Observers';

export type Provenance<T, S = void, A = void> = {
  state: T;
  graph: ProvenanceGraph<T, S, A>;
  current: ProvenanceNode<T, S, A>;
  root: RootNode<T, S>;
  apply: (action: ActionObject<T, S>) => void;
  addGlobalObserver: (observer: GlobalObserver<T, S, A>) => void;
  addObserver: (
    expression: ObserverExpression<T>,
    effect: ObserverEffect<T>
  ) => void;
  goToNode: (id: NodeID) => void;
  addArtifact: (id: NodeID, artifact: A) => void;
  addAnnotation: (id: NodeID, annotation: string) => void;
  goBackOneStep: () => void;
  goForwardOneStep: (to?: 'latest' | 'oldest') => void;
  goBackToNonEphemeral: () => void;
  goForwardToNonEphemeral: (to?: 'latest' | 'oldest') => void;
  setBookmark: (id: NodeID, bookmark: boolean) => void;
  getBookmark: (id: NodeID) => boolean;
  reset: () => void;
  exportState: (partial?: boolean) => string;
  importState: (state: string | Partial<T>) => void;
  importProvenanceGraph: (graph: string | ProvenanceGraph<T, S, A>) => void;
  exportProvenanceGraph: () => string;
  getState: (node: ProvenanceNode<T, S, A>) => T;
  done: () => void;
};
