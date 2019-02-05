import { NodeID, NodeMetadata, Artifacts } from "./Nodes";
import { Action } from "./Actions";

export type SerializedProveananceGraph = {
  nodes: SerializedProvenanceNode[];
  root: NodeID;
  current: NodeID;
};

export type SerializedRootNode = {
  id: NodeID;
  children: NodeID[];
  label: string;
  metadata: NodeMetadata;
  artifacts: Artifacts;
};

export type SerializedStateNode = SerializedRootNode & {
  parent: NodeID;
  action: Action;
  actionResult: any;
};

export type SerializedProvenanceNode = SerializedStateNode & SerializedRootNode;
