import { NodeAction } from "./Actions";
import { NodeActionsEnum } from "../ActionsEnum";
import { deepCopy } from "../../utils/utils";
import { ProvenanceNode, Nodes } from "../NodeInterfaces";

export function nodeReducer<T>(
  nodes: Nodes<T> = {},
  action: NodeAction<T>
): Nodes<T> {
  switch (action.type) {
    case NodeActionsEnum.ADD_NODE:
      return addNode(nodes, action.node);
    case NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE:
      return updateNodes(nodes, action.node);
    default:
      return nodes;
  }
}

export function addNode<T>(nodes: Nodes<T>, node: ProvenanceNode<T>): Nodes<T> {
  if (nodes[node.id]) throw new Error("Node already exists");
  let newNodes = deepCopy(nodes);
  newNodes[node.id] = node;
  return newNodes;
}

export function updateNodes<T>(
  nodes: Nodes<T>,
  node: ProvenanceNode<T>
): Nodes<T> {
  const _nodes = deepCopy(nodes);
  _nodes[node.id] = node;
  return _nodes;
}
