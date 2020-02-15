import { ProvenanceGraph } from './ProvenanceGraph';
import {
  NodeID,
  NodeMetadata,
  Artifacts,
  RootNode,
  ProvenanceNode,
  Extra,
  StateNode
} from './NodeInterfaces';

export type SubscriberFunction<T> = (state?: T) => void;

export type ArtifactSubscriberFunction<T, S, A> = (node: StateNode<T, S, A>) => void;

export type ActionFunction<T> = (currentState: T, ...args: any[]) => T;

export type ExportedState<T> = Partial<T>;

export default interface Provenance<T, S, A> {
  graph: () => ProvenanceGraph<T, S, A>;
  current: () => ProvenanceNode<T, S, A>;
  root: () => RootNode<T, S>;
  applyAction: (
    label: string,
    action: ActionFunction<T>,
    args?: any[],
    metadata?: NodeMetadata<S>,
    artifacts?: Artifacts<A>,
    eventType?: S
  ) => T;

  addObserver: (propPath: string[], func: SubscriberFunction<T>) => void;
  addArtifactObserver: (func: ArtifactSubscriberFunction<T, S, A>) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;

  addExtraToNodeArtifact: (id: NodeID, extra: A) => void;
  getExtraFromArtifact: (id: NodeID) => Extra<A>[];

  goToNode: (id: NodeID) => void;
  goBackOneStep: () => void;
  goBackNSteps: (n: number) => void;
  goForwardOneStep: () => void;

  reset: () => void;
  done: () => void;

  exportState: (partial?: boolean) => string;
  importState: (importString: string) => void;

  exportProvenanceGraph: () => string;
  importProvenanceGraph: (importString: string) => void;
}
