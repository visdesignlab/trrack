import { ASerializable } from '../utils/serializable';
import { INode, IRootNode, RootNode } from './nodes';

export type SerializedProvenanceGraph = {
  current: string;
  root: string;
  nodes: { [k: string]: any };
};

export class ProvenanceGraph extends ASerializable {
  private nodes: INode[];
  current: INode;
  root: IRootNode;

  constructor() {
    super();
    const root = RootNode.create();
    this.root = root;
    this.current = root;
    this.nodes = [];
    this.nodes.push(root);
  }

  static setup() {
    return new ProvenanceGraph();
  }

  addNode(node: INode, setCurrent: boolean = true) {
    this.nodes.push(node);

    if (setCurrent) {
      this.current = node;
    }
  }

  toJSON() {
    const nodes: { [k: string]: any } = {};

    this.nodes.forEach((node) => {
      nodes[node.id] = node.toJSON();
    });

    return {
      current: this.current.id,
      root: this.root.id,
      nodes,
    };
  }
}
