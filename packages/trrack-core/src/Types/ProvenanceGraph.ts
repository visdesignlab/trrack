import { Nodes, NodeID } from './Nodes';

export interface ProvenanceGraph<T, S, A> {
  nodes: Nodes<T, S, A>;
  current: NodeID;
  root: NodeID;
}
