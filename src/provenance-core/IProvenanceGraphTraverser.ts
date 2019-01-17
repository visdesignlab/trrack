import { IProvenanceGraph } from "./IProvenanceGraph";
import { NodeID, ProvenanceNode } from "./Nodes";

export interface IProvenanceGraphTraverser {
  graph: IProvenanceGraph;

  toStateNode(id: NodeID): Promise<ProvenanceNode>;
}
