import { Action, ActionFunctionWithThis } from "./Actions";
import { IProvenanceGraph } from "./IProvenanceGraph";
import { IActionFunctionRegistry } from "./IActionFunctionRegistry";
import { IProvenanceTracker } from "./IProvenanceTracker";
import { StateNode, ProvenanceNode } from "./Nodes";
import { generateUUID, generateTimeStamp } from "../utils/utils";

export class ProvenanceTracker implements IProvenanceTracker {
  registry: IActionFunctionRegistry;
  private graph: IProvenanceGraph;
  private username: string;

  constructor(
    registry: IActionFunctionRegistry,
    graph: IProvenanceGraph,
    username: string = "Unknown"
  ) {
    this.registry = registry;
    this.graph = graph;
    this.username = username;
  }

  async applyAction(
    action: Action,
    skipFirstDoFunctionCall: boolean = false
  ): Promise<StateNode> {
    const createNewStateNode = (
      parentNode: ProvenanceNode,
      actionResult: any
    ): StateNode => ({
      id: generateUUID(),
      label: action.do,
      metadata: {
        createdBy: this.username,
        createdOn: generateTimeStamp()
      },
      action,
      actionResult,
      parent: parentNode,
      children: [],
      artifacts: []
    });

    let newNode: StateNode;

    const currentNode = this.graph.current;

    if (skipFirstDoFunctionCall) {
      newNode = createNewStateNode(this.graph.current, null);
    } else {
      const functionNameToExecute: string = action.do;
      const funcWithThis: ActionFunctionWithThis = this.registry.getFunctionByName(
        functionNameToExecute
      );
      const actionResult = await funcWithThis.func.apply(
        funcWithThis.thisArg,
        action.doArgs
      );

      newNode = createNewStateNode(currentNode, actionResult);
    }

    return newNode;
  }
}
