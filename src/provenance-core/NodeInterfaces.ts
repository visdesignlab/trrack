import { ReversibleAction, ResetAction } from "./ProvenanceActions";

export type NodeID = string;

export interface NodeMetadata {
  createdOn: number;
  [key: string]: any;
}

export interface Artifacts {
  [key: string]: any;
}

export interface BaseNode<T> {
  state?: T;
}

export interface RootNode<T> extends BaseNode<T> {
  id: NodeID;
  label: string;
  metadata: NodeMetadata;
  children: NodeID[];
  artifacts: Artifacts;
  state?: Readonly<T>;
}

export interface StateNode<T> extends RootNode<T> {
  parent: NodeID;
  action: ReversibleAction<unknown, unknown> | ResetAction<unknown>;
  actionResult: unknown;
}

export type ProvenanceNode<T> = RootNode<T> | StateNode<T>;

export type Nodes<T> = { [key: string]: ProvenanceNode<T> };

export type CurrentNode<T> = ProvenanceNode<T>;

export function isStateNode<T>(node: ProvenanceNode<T>): node is StateNode<T> {
  return "parent" in node;
}
