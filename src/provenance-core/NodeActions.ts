import { Action } from "redux";
import { NodeActionsEnum } from "./ActionsEnum";
import { ProvenanceNode, NodeID } from "./Nodes";
import { Nodes } from "./ProvenanceGraph";
import { Reducer } from "redux";
import { deepCopy } from "../utils/utils";

export type NodeAction = AddNodeAction | UpdateNewlyAddedNodeAction;

export interface AddNodeAction extends Action {
  type: NodeActionsEnum.ADD_NODE;
  node: ProvenanceNode;
}

export interface UpdateNewlyAddedNodeAction extends Action {
  type: NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE;
  node: ProvenanceNode;
}

export function createAddNodeAction(node: ProvenanceNode): AddNodeAction {
  return {
    type: NodeActionsEnum.ADD_NODE,
    node: node
  };
}

export function createUpdateNewlyAddedNodeAction(
  node: ProvenanceNode
): UpdateNewlyAddedNodeAction {
  return {
    type: NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE,
    node: node
  };
}

export const nodeReducer: Reducer<Nodes> = (
  nodes: Nodes = {},
  action: NodeAction
) => {
  switch (action.type) {
    case NodeActionsEnum.ADD_NODE:
      return addNode(nodes, action.node);
    case NodeActionsEnum.UPDATE_NEWLY_ADDED_NODE:
      return updateNodes(nodes, action.node);
    default:
      return nodes;
  }
};

export function addNode(nodes: Nodes, node: ProvenanceNode): Nodes {
  if (nodes[node.id]) throw new Error("Node already exists");
  let newNodes = deepCopy(nodes);
  newNodes[node.id] = node;
  return newNodes;
}

export function updateNodes(nodes: Nodes, node: ProvenanceNode): Nodes {
  const _nodes = deepCopy(nodes);
  _nodes[node.id] = node;
  return _nodes;
}
