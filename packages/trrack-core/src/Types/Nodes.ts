/* eslint-disable no-shadow */
import { Diff, applyChange } from 'deep-diff';
import { toJS } from 'mobx';
import { ActionType } from './Action';
import { ProvenanceGraph } from './ProvenanceGraph';
import deepCopy from '../Utils/DeepCopy';

export type DiffExport<L, R = L> = Diff<L, R>;

export type NodeID = string;

export type Meta = { [key: string]: any };

export type NodeMetadata<S> = {
  createdOn?: number;
  eventType: S | 'Root';
} & Meta;

type BaseArtifact = {
  timestamp: number;
};

export type Annotation = BaseArtifact & {
  annotation: string;
};

export type Artifact<A> = BaseArtifact & {
  artifact: A;
};

export type Artifacts<A> = {
  annotations: Annotation[];
  customArtifacts: Artifact<A>[];
};

export interface BaseNode<S> {
  id: NodeID;
  label: string;
  metadata: NodeMetadata<S>;
  children: NodeID[];
  actionType: ActionType;
  bookmarked: boolean;
}

export interface RootNode<T, S> extends BaseNode<S> {
  state: T;
}

export interface ChildNode<S, A> extends BaseNode<S> {
  parent: NodeID;
  artifacts: Artifacts<A>;
}

export interface StateNode<T, S, A> extends RootNode<T, S>, ChildNode<S, A> {}

export interface DiffNode<T, S, A> extends ChildNode<S, A> {
  diffs: Diff<T>[];
  lastStateNode: NodeID;
}

export type ProvenanceNode<T, S, A> =
  | RootNode<T, S>
  | StateNode<T, S, A>
  | DiffNode<T, S, A>;

export type Nodes<T, S, A> = { [key: string]: ProvenanceNode<T, S, A> };

export type CurrentNode<T, S, A> = ProvenanceNode<T, S, A>;

/**
 * Function for checking if a node is a state node.
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 * Extra is a way to store customized metadata.
 * @param _opts: Given node to check if it is a state node.
 */
export function isStateNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is StateNode<T, S, A> {
  return 'parent' in node && 'state' in node;
}

/**
 * Function for checking if a node is a diff node.
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 * Extra is a way to store customized metadata.
 * @param _opts: Given node to check if it is a diff node.
 */
export function isDiffNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is DiffNode<T, S, A> {
  return 'diffs' in node;
}

/**
 * Function for checking if a node is a child node.
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 *  Extra is a way to store customized metadata.
 * @param _opts: Given node to check if it is a child node.
 */
export function isChildNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is DiffNode<T, S, A> | StateNode<T, S, A> {
  return 'parent' in node;
}

/**
 * Function for checking if a node is the root node.
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 * Extra is a way to store customized metadata.
 * @param _opts: Given node to check if it is root.
 */
export function isRootNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is RootNode<T, S> {
  return node.label === 'Root';
}

/**
`* Retrieve the state of a node. `
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 * Extra is a way to store customized metadata.
 * @param graph: Provenance Graph which we are searching for node in
 * @param _opts: Node which we want the state of
 */
export function getState<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  node: ProvenanceNode<T, S, A>,
  // eslint-disable-next-line no-unused-vars
  deserializer: (t: any) => T,
): T {
  if (isRootNode(node) || isStateNode(node)) {
    return toJS(node.state);
  }

  // eslint-disable-next-line no-underscore-dangle
  const _state = toJS(
    (graph.nodes[node.lastStateNode] as StateNode<T, S, A>).state,
  );

  const state = deepCopy(_state, deserializer);

  // what is this for?
  node.diffs.forEach((diff) => {
    applyChange(state, null, diff);
  });

  return state;
}
