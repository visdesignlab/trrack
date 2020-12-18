import { Nodes, NodeID } from './Nodes';

/**
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 * Extra is a way to store customized metadata.
 */
export interface ProvenanceGraph<T, S, A> {
  nodes: Nodes<T, S, A>;
  current: NodeID;
  root: NodeID;
}
