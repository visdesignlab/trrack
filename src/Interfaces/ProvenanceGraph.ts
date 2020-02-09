import { Nodes, NodeID } from './NodeInterfaces';

export interface ProvenanceGraph<T, S> {
  nodes: Nodes<T, S>;
  current: NodeID;
  root: NodeID;
}
