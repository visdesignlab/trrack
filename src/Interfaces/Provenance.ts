import { ProvenanceGraph } from './ProvenanceGraph';
import { NodeID, NodeMetadata, Artifacts, RootNode, ProvenanceNode } from './NodeInterfaces';

export type SubscriberFunction<T> = (state?: T) => void;

export type ActionFunction<T> = (currentState: T, ...args: any[]) => T;

export type ExportedState<T> = Partial<T>;

export default interface Provenance<T> {
  graph: () => ProvenanceGraph<T>;
  current: () => ProvenanceNode<T>;
  root: () => RootNode<T>;
  applyAction: (
    label: string,
    action: ActionFunction<T>,
    args?: any[],
    metadata?: NodeMetadata,
    artifacts?: Artifacts
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

  exportProvenanceGraph: () => ProvenanceGraph<T>;
  importProvenanceGraph: (graph: ProvenanceGraph<T>) => void;
}
