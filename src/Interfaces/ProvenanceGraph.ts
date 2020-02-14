import { Nodes, NodeID } from './NodeInterfaces';

export interface ProvenanceGraph<T, S, A> {
  nodes: Nodes<T, S, A>;
  current: NodeID;
  root: NodeID;
}
