import { NodeID, ProvenanceNode, RootNode } from './NodeInterfaces';
import { ProvenanceGraph } from './ProvenanceGraph';
import { ActionObject } from './Action';
import { GlobalObserver, Observer } from './Observers';

export type Provenance<T, S = void, A = void> = {
  state: T;
  graph: ProvenanceGraph<T, S, A>;
  current: ProvenanceNode<T, S, A>;
  root: RootNode<T, S>;
  apply: (action: ActionObject<T>) => void;
  addGlobalObserver: (observer: GlobalObserver<T, S, A>) => void;
  addObserver: (data: string, observer: Observer<T>) => void;
  goToNode: (id: NodeID) => void;
};
