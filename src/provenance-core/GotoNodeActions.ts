import { Store, AnyAction } from "redux";
import { ProvenanceGraph } from "./ProvenanceGraph";
import { NodeID, ProvenanceNode, isStateNode, Nodes, StateNode} from "./NodeInterfaces";
import { GenericAction, ResetActionCreator, ResetAction } from "./ProvenanceActions";
import { createChangeCurrentAction } from "./CurrentActions/ActionCreators";

export function toNode<T>(
  graph: Store<ProvenanceGraph, AnyAction>,
  application: Store<T>,
  id: NodeID
) {
  try {
    const currentNode = graph.getState().current;
    const targetNode = graph.getState().nodes[id];
    if (currentNode === targetNode) return;

    const trackToTarget: ProvenanceNode[] = [];

    const success = findPathToTargetNode(
      graph.getState().nodes,
      currentNode,
      targetNode,
      trackToTarget
    );

    if (!success) {
      throw new Error("No Path found!");
    }
    const actions: GenericAction<unknown>[] = [];

    for (let i = 0; i < trackToTarget.length - 1; ++i) {
      const thisNode = trackToTarget[i];
      const nextNode = trackToTarget[i + 1];

      const up = isNextNodeInTrackUp(thisNode, nextNode);
      if (up) {
        if (isStateNode(thisNode)) {
          actions.push(thisNode.action.undoAction);
        } else {
          throw new Error("At root node!");
        }
      } else {
        if (isStateNode(nextNode)) {
          actions.push(nextNode.action.doAction);
        } else {
          throw new Error("At root node!");
        }
      }
    }

    applyActions(application, actions);

    // * Change current
    graph.dispatch(createChangeCurrentAction(targetNode));
  } catch (err) {
    throw new Error(err);
  }
}

export function toNodeWithState<T>(
  graph: Store<ProvenanceGraph, AnyAction>,
  application: Store<T>,
  id: NodeID,
  inputString: string
) {
  try {
    const currentNode = graph.getState().current;
    const targetNode = graph.getState().nodes[id];

    if(!isStateNode(targetNode)) {
      throw new Error("Target not a state node");
    }

    if (currentNode === targetNode) return;

    const trackToTarget: ProvenanceNode[] = [];

    const success = findPathToTargetNode(
      graph.getState().nodes,
      currentNode,
      targetNode,
      trackToTarget
    );

    if (!success) {
      throw new Error("No Path found!");
    }

    if(!isStateNode(targetNode)) {
      throw new Error("Target not a state node");
    }

    const stateTargetNode = targetNode as StateNode;

    const createResetAction = (toSet: any) : ResetAction<any> => {
      return ResetActionCreator(inputString, toSet);
    };

    let action = createResetAction(stateTargetNode.state);

    application.dispatch(action.doAction);

    graph.dispatch(createChangeCurrentAction(targetNode));
  } catch (err) {
    throw new Error(err);
  }
}

function findPathToTargetNode(
  nodes: Nodes,
  currentNode: ProvenanceNode,
  targetNode: ProvenanceNode,
  track: ProvenanceNode[],
  comingFromNode: ProvenanceNode = currentNode
): boolean {
  if (currentNode && currentNode === targetNode) {
    track.unshift(currentNode);
    return true;
  } else if (currentNode) {
    const nodesToCheck: ProvenanceNode[] = currentNode.children.map(
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

function isNextNodeInTrackUp(
  currentNode: ProvenanceNode,
  nextNode: ProvenanceNode
): boolean {
  if (isStateNode(currentNode) && currentNode.parent === nextNode.id) {
    return true;
  } else if (isStateNode(nextNode) && nextNode.parent != currentNode.id) {
    throw new Error("Unconnected nodes.");
  }
  return false;
}

function applyActions<T>(app: Store<T>, actions: GenericAction<unknown>[]) {
  try {
    for (let i = 0; i < actions.length; ++i) app.dispatch(actions[i]);
  } catch (err) {
    console.error(err);
  }
}
