import { Handler } from "./Handler";
import { IProvenanceGraph } from "./IProvenanceGraph";
import { Manager } from "reactivityframework";
import { RootNode, ProvenanceNode, NodeID } from "./Nodes";
import { generateUUID, generateTimeStamp } from "../utils/utils";

export class ProvenanceGraph implements IProvenanceGraph {
  public readonly root: RootNode;
  private _current: ProvenanceNode;
  private _nodes: { [key: string]: ProvenanceNode } = {};

  constructor(userId: string = "unknown", root?: RootNode) {
    if (root) this.root = root;
    else {
      this.root = {
        id: generateUUID(),
        label: "Root",
        metadata: {
          createdBy: userId,
          createdOn: generateTimeStamp()
        },
        children: [],
        artifacts: {}
      } as RootNode;
    }

    this.addNode(this.root);
    this._current = this.root;
  }

  addNode(node: ProvenanceNode) {
    if (this._nodes[node.id]) throw new Error("Node already added");
    this._nodes[node.id] = node;
    Manager.emit("node-added", node);
  }

  getNode(id: NodeID) {
    if (!this._nodes[id]) throw new Error("Node not found!");
    return this._nodes[id];
  }

  get current() {
    return this._current;
  }

  get nodes() {
    return this._nodes;
  }

  set current(node: ProvenanceNode) {
    if (!this._nodes[node.id]) throw new Error("Node not found");
    this._current = node;
    Manager.emit("current-changed", node);
  }

  emitNodeChangedEvent(node: ProvenanceNode) {
    if (!this._nodes[node.id]) throw new Error("Node not found");
    Manager.emit("node-changed", node);
  }

  on(type: string, handler: Handler, thisArg?: any) {
    if (thisArg) Manager.on(type, handler, thisArg);
    else Manager.on(type, handler);
  }

  off(type: string, handler: Handler) {
    Manager.off(type, handler);
  }
}
