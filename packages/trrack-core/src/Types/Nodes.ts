/* eslint-disable no-shadow */
import { applyChange, Diff } from 'deep-diff';
import { toJS } from 'mobx';
import deepCopy from '../Utils/DeepCopy';
import { ActionType } from './Action';
import { ProvenanceGraph } from './ProvenanceGraph';
import { JsonValue } from './Serializers';

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

export interface RootNode<S> extends BaseNode<S> {
  state: JsonValue;
}

export interface ChildNode<S, A> extends BaseNode<S> {
  parent: NodeID;
  artifacts: Artifacts<A>;
}

export interface StateNode<S, A> extends RootNode<S>, ChildNode<S, A> {}

export interface DiffNode<S, A> extends ChildNode<S, A> {
  diffs: Diff<JsonValue>[];
  lastStateNode: NodeID;
}

export type ProvenanceNode<S, A> = RootNode<S> | StateNode<S, A> | DiffNode<S, A>;

export type Nodes<S, A> = { [key: string]: ProvenanceNode<S, A> };

export type CurrentNode<S, A> = ProvenanceNode<S, A>;

/**
 * Function for checking if a node is a state node.
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 * Extra is a way to store customized metadata.
 * @param _opts: Given node to check if it is a state node.
 */
export function isStateNode<S, A>(node: ProvenanceNode<S, A>): node is StateNode<S, A> {
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
export function isDiffNode<S, A>(node: ProvenanceNode<S, A>): node is DiffNode<S, A> {
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
export function isChildNode<S, A>(
  node: ProvenanceNode<S, A>,
): node is DiffNode<S, A> | StateNode<S, A> {
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
export function isRootNode<S, A>(node: ProvenanceNode<S, A>): node is RootNode<S> {
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
export function getState<S, A>(
  graph: ProvenanceGraph<S, A>,
  node: ProvenanceNode<S, A>,
): JsonValue {
  if (isRootNode(node) || isStateNode(node)) {
    return toJS(node.state);
  }

  // eslint-disable-next-line no-underscore-dangle
  const _state = toJS((graph.nodes[node.lastStateNode] as StateNode<S, A>).state);

  const state = deepCopy(_state);

  // what is this for?
  node.diffs.forEach((diff) => {
    applyChange(state, null, diff);
  });

  return state;
}
