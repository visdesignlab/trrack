import { IProvenanceGraphTraverser } from "./IProvenanceGraphTraverser";
import { IActionFunctionRegistry } from "./IActionFunctionRegistry";
import { ProvenanceNode, isStateNode, StateNode, NodeID } from "./Nodes";
import { ActionFunctionWithThis, isReversibleAction } from "./Actions";
import { IProvenanceGraph } from "./IProvenanceGraph";

function isNextNodeInTrackUp(
  currentNode: ProvenanceNode,
  nextNode: ProvenanceNode
): boolean {
  if (isStateNode(currentNode) && currentNode.parent === nextNode) {
    return true;
  } else if (isStateNode(nextNode) && nextNode.parent !== currentNode) {
    throw new Error("Unconnected nodes. Illegal use of function.");
  } else {
    return false;
  }
}

function findPathToTargetNode(
  currentNode: ProvenanceNode,
  targetNode: ProvenanceNode,
  track: ProvenanceNode[],
  comingFromNode: ProvenanceNode = currentNode
): boolean {
  if (currentNode && currentNode === targetNode) {
    track.unshift(currentNode);
    return true;
  } else if (currentNode) {
    const nodesToCheck: ProvenanceNode[] = [...currentNode.children];

    if (isStateNode(currentNode)) {
      nodesToCheck.push(currentNode.parent);
    }

    for (let node of nodesToCheck) {
      // If already in track, skip
      if (node === comingFromNode) continue;
      if (findPathToTargetNode(node, targetNode, track, currentNode)) {
        track.unshift(currentNode);
        return true;
      }
    }
  }

  eval("console").log(track);
  return false;
}

async function executeFunctions(
  functionsToDo: ActionFunctionWithThis[],
  argumentsToDo: any[]
): Promise<StateNode> {
  let result;

  for (let i = 0; i < functionsToDo.length; ++i) {
    let funcWithThis = functionsToDo[i];
    result = await funcWithThis.func.apply(
      funcWithThis.thisArg,
      argumentsToDo[i]
    );
  }
  return result;
}

export class ProvenanceGraphTraverser implements IProvenanceGraphTraverser {
  public graph: IProvenanceGraph;
  private registry: IActionFunctionRegistry;

  constructor(registry: IActionFunctionRegistry, graph: IProvenanceGraph) {
    this.registry = registry;
    this.graph = graph;
  }

  toStateNode(id: NodeID): Promise<ProvenanceNode> {
    try {
      const currentNode = this.graph.current;
      const targetNode = this.graph.getNode(id);

      if (currentNode === targetNode) {
        return Promise.resolve(currentNode);
      }

      const trackToTarget: ProvenanceNode[] = [];
      const success = findPathToTargetNode(
        currentNode,
        targetNode,
        trackToTarget
      );

      if (!success) {
        throw new Error("No path found");
      }

      const functionsToDo: ActionFunctionWithThis[] = [];
      const argumentsToDo: any[] = [];

      for (let i = 0; i < trackToTarget.length - 1; ++i) {
        const thisNode = trackToTarget[i];
        const nextNode = trackToTarget[i + 1];
        const up = isNextNodeInTrackUp(thisNode, nextNode);

        if (up) {
          if (isStateNode(thisNode)) {
            if (!isReversibleAction(thisNode.action)) {
              throw new Error("Cannot undo an irreversible action");
            }
            const undoFunc = this.registry.getFunctionByName(
              thisNode.action.undo
            );
            functionsToDo.push(undoFunc);
            argumentsToDo.push(thisNode.action.undoArgs);
          } else {
            throw new Error("At root node now! Cannot go further back!");
          }
        } else {
          if (isStateNode(nextNode)) {
            const doFunc = this.registry.getFunctionByName(nextNode.action.do);
            functionsToDo.push(doFunc);
            argumentsToDo.push(nextNode.action.doArgs);
          } else {
            throw new Error("At root! unreachable!");
          }
        }
      }
      const result = executeFunctions(functionsToDo, argumentsToDo);
      result.then(() => (this.graph.current = targetNode));
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
