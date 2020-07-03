const applyChange = require('deep-diff').applyChange;
import { ProvenanceGraph } from './ProvenanceGraph';
import deepCopy from '../Utils/DeepCopy';

export type NodeID = string;

export interface NodeMetadata<S> {
  createdOn?: number;
  type?: S | 'Root';
  //remove?
  [key: string]: any;
}

interface DiffAnyProps {
  [key: string]: any;
}

export type Diff = DiffAnyProps & {
  path: string[];
};

export interface Extra<A> {
  time: number;
  e: A;
}

export interface Artifacts<A> {
  diffs?: Diff[];
  annotation?: string;
  //array
  extra: Extra<A>[];
  //remove?
  [key: string]: any;
}

export interface BaseNode<T, S> {
  id: NodeID;
  label: string;
  metadata: NodeMetadata<S>;
  children: NodeID[];
  getState: () => T;
  ephemeral: boolean;
}

export interface RootNode<T, S> extends BaseNode<T, S> {
  state: T;
}

export interface ChildNode<T, S, A> extends BaseNode<T, S> {
  parent: NodeID;
  artifacts: Artifacts<A>;
}

export interface StateNode<T, S, A> extends RootNode<T, S>, ChildNode<T, S, A> {}

export interface DiffNode<T, S, A> extends ChildNode<T, S, A> {
  diffs: Diff[];
  lastStateNode: NodeID;
}

export type ProvenanceNode<T, S, A> = RootNode<T, S> | StateNode<T, S, A> | DiffNode<T, S, A>;

export type Nodes<T, S, A> = { [key: string]: ProvenanceNode<T, S, A> };

export type CurrentNode<T, S, A> = ProvenanceNode<T, S, A>;

export function isStateNode<T, S, A>(node: ProvenanceNode<T, S, A>): node is StateNode<T, S, A> {
  return 'parent' in node && 'state' in node;
}

export function isDiffNode<T, S, A>(node: ProvenanceNode<T, S, A>): node is DiffNode<T, S, A> {
  return 'diffs' in node;
}

export function isChildNode<T, S, A>(
  node: ProvenanceNode<T, S, A>
): node is DiffNode<T, S, A> | StateNode<T, S, A> {
  return 'parent' in node;
}
