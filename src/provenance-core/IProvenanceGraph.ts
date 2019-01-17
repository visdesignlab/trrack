import { Handler } from "./Handler";
import { ProvenanceNode, RootNode, NodeID } from "./Nodes";

export interface IProvenanceGraph {
  current: ProvenanceNode;
  root: RootNode;

  addNode(node: ProvenanceNode): void;
  getNode(id: NodeID): ProvenanceNode;
  emitNodeChangedEvent(node: ProvenanceNode): void;

  on(type: string, handler: Handler, thisArg?: any): void;
  off(type: string, handler: Handler): void;
}
