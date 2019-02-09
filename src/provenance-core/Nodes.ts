import { ReversibleAction } from "./ProvenanceActions";

export type NodeID = string;

export interface NodeMetadata {
  createdOn: number;
  [key: string]: any;
}

export interface Artifacts {
  [key: string]: any;
}

export interface RootNode {
  id: NodeID;
  label: string;
  metadata: NodeMetadata;
  children: NodeID[];
  artifacts: Artifacts;
}

export interface StateNode extends RootNode {
  parent: NodeID;
  action: ReversibleAction<unknown, unknown>;
  actionResult: unknown;
}

export type ProvenanceNode = RootNode | StateNode;

export function isStateNode(node: ProvenanceNode): node is StateNode {
  return "parent" in node;
}
