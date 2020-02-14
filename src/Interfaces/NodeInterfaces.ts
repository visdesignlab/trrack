export type NodeID = string;

export interface NodeMetadata<S> {
  createdOn?: number;
  type?: S | 'Root';
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
  extra?: Extra<A>[];
  [key: string]: any;
}

export interface BaseNode<T> {
  state: T;
}

export interface RootNode<T, S> extends BaseNode<T> {
  id: NodeID;
  label: string;
  metadata: NodeMetadata<S>;
  children: NodeID[];
  state: T;
}

export interface StateNode<T, S, A> extends RootNode<T, S> {
  parent: NodeID;
  artifacts: Artifacts<A>;
}

export type ProvenanceNode<T, S, A> = RootNode<T, S> | StateNode<T, S, A>;

export type Nodes<T, S, A> = { [key: string]: ProvenanceNode<T, S, A> };

export type CurrentNode<T, S, A> = ProvenanceNode<T, S, A>;

export function isStateNode<T, S, A>(node: ProvenanceNode<T, S, A>): node is StateNode<T, S, A> {
  return 'parent' in node;
}
