import { Store, AnyAction } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import { NodeID, ProvenanceNode, isStateNode, Nodes } from "./NodeInterfaces";
import { createChangeCurrentAction } from "./CurrentActions/ActionCreators";

export function toNodeRedux<T>(
  graph: Store<ProvenanceGraph<T>, AnyAction>,
  id: NodeID
) {
  try {
    const currentNode = graph.getState().current;
    const targetNode = graph.getState().nodes[id];
    if (currentNode === targetNode) return;

    const trackToTarget: ProvenanceNode<T>[] = [];

    const success = findPathToTargetNode(
      graph.getState().nodes,
      currentNode,
      targetNode,
      trackToTarget
    );

    if (!success) {
      throw new Error("No Path found!");
    }

    // * Change current
    graph.dispatch(createChangeCurrentAction(targetNode));
  } catch (err) {
    throw new Error(err);
  }
}

export function toNode<T>(graph: Store<ProvenanceGraph<T>>, id: NodeID): T {
  try {
    const currentNode = graph.getState().current;
    const targetNode = graph.getState().nodes[id];

    if (currentNode === targetNode) return currentNode.state;

    graph.dispatch(createChangeCurrentAction(targetNode));
    return targetNode.state;
  } catch (err) {
    throw new Error(err);
  }
}

function findPathToTargetNode<T>(
  nodes: Nodes<T>,
  currentNode: ProvenanceNode<T>,
  targetNode: ProvenanceNode<T>,
  track: ProvenanceNode<T>[],
  comingFromNode: ProvenanceNode<T> = currentNode
): boolean {
  if (currentNode && currentNode === targetNode) {
    track.unshift(currentNode);
    return true;
  } else if (currentNode) {
    const nodesToCheck: ProvenanceNode<T>[] = currentNode.children.map(
      c => nodes[c]
    );

    if (isStateNode(currentNode)) {
      nodesToCheck.push(nodes[currentNode.parent]);
    }

    for (let node of nodesToCheck) {
      if (node === comingFromNode) continue;
      if (findPathToTargetNode(nodes, node, targetNode, track, currentNode)) {
        track.unshift(currentNode);
        return true;
      }
    }
  }

  return false;
}
