import { ProvenanceGraph } from './ProvenanceGraph';
import { NodeID, NodeMetadata, Artifacts, RootNode, ProvenanceNode } from './NodeInterfaces';

export type SubscriberFunction<T> = (state?: T) => void;

export type ActionFunction<T> = (currentState: T, ...args: any[]) => T;

export type ExportedState<T> = Partial<T>;

export default interface Provenance<T, S> {
  graph: () => ProvenanceGraph<T, S>;
  current: () => ProvenanceNode<T, S>;
  root: () => RootNode<T, S>;
  applyAction: (
    label: string,
    action: ActionFunction<T>,
    args?: any[],
    metadata?: NodeMetadata<S>,
    artifacts?: Artifacts,
    eventType?: S
  ) => T;

  addObserver: (propPath: string[], func: SubscriberFunction<T>) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;

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
