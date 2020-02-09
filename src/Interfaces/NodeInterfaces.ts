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

export interface Artifacts {
  diffs?: Diff[];
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

export interface StateNode<T, S> extends RootNode<T, S> {
  parent: NodeID;
  artifacts: Artifacts;
}

export type ProvenanceNode<T, S> = RootNode<T, S> | StateNode<T, S>;

export type Nodes<T, S> = { [key: string]: ProvenanceNode<T, S> };

export type CurrentNode<T, S> = ProvenanceNode<T, S>;

export function isStateNode<T, S>(node: ProvenanceNode<T, S>): node is StateNode<T, S> {
  return 'parent' in node;
}
