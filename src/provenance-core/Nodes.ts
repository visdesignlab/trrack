import { Action } from "./Actions";

export type NodeID = string;

export type NodeMetadata = {
  createdBy: string;
  createdOn: number;
  [key: string]: any;
};

export type Artifacts = {
  [key: string]: any;
};

export type RootNode = {
  id: NodeID;
  label: string;
  metadata: NodeMetadata;
  children: StateNode[];
  artifacts: Artifacts;
};

export type StateNode = RootNode & {
  action: Action;
  actionResult: any;
  parent: ProvenanceNode;
};

export type ProvenanceNode = RootNode | StateNode;

export function isStateNode(node: ProvenanceNode): node is StateNode {
  return "parent" in node;
}
