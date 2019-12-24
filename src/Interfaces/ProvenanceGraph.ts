import { Nodes, NodeID } from './NodeInterfaces';

export interface ProvenanceGraph<T> {
  nodes: Nodes<T>;
  current: NodeID;
  root: NodeID;
}
