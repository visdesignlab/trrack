import { Action, ActionRegistry } from '../action';
import { ActionNode, ProvenanceGraph } from '../graph';
import { RootNode } from '../graph/nodes/rootnode';
import { INode } from '../graph/nodes/types';

type RegistryType<R> = R extends ActionRegistry<infer T> ? T : never;

export class Trrack<T extends ActionRegistry<any>> {
  private registry: T;
  private graph: ProvenanceGraph;

  constructor(registry: T) {
    this.registry = registry;
    this.graph = ProvenanceGraph.setup();
  }

  static initialize<T extends ActionRegistry<any>>(reg: T) {
    return new Trrack(reg);
  }

  private get current() {
    return this.graph.current;
  }

  private get root() {
    return this.graph.root;
  }

  get tree() {
    return getTreeFromNode(this.root);
  }

  apply<
    R extends RegistryType<T>,
    K extends keyof R,
    D extends Parameters<R[K]['apply']>,
    U extends Parameters<R[K]['inverse']>
  >(action: Action<K, D, U>) {
    // Execute the action first.
    const results = this.registry.get(action.name).apply(action.doArgs);
    const newNode = new ActionNode(this.current, action, results);
    this.graph.addNode(newNode);

    return newNode;
  }

  getSerializedGraph() {
    return this.graph.toJSON();
  }

  undo() {
    if (RootNode.isNonRootNode(this.current))
      this.graph.current = this.current.parent;
  }

  redo() {
    if (this.current.children.length > 0)
      this.graph.current = this.current.children[0];
  }
}

// export function initializeTrrack(registry: ActionFunctionRegistry<any>) {
//   return {
//     applyAction(action: Action, skipFirst: boolean = false) {
//       const results = skipFirst ? null : registryTracker.applyDo(action);

//       const newNode = addNewActionNode(
//         action.label,
//         action,
//         this.current,
//         results
//       );

//       graphRecord.addEdge(this.current.id, newNode.id);
//       graphRecord.setLevel(this.current.id, newNode.id);

//       this.graph.nodes[newNode.id] = newNode;
//       this.graph.current = newNode.id;

//       return results;
//     },
//     goToNode(id: string) {
//       if (!this.graph.nodes[id])
//         throw new Error(`Node with id ${id} not found.`);

//       const path = getPathToNode(this.graph.current, id, graphRecord);

//       const functionsToApply: {
//         action: Action;
//         direction: 'up' | 'down';
//       }[] = [];

//       for (let i = 0; i < path.length - 1; ++i) {
//         const currentNode = this.graph.nodes[path[i]] as ActionNode;
//         const nextNode = this.graph.nodes[path[i + 1]] as ActionNode;

//         const isGoingUp = isNextNodeUp(
//           currentNode.id,
//           nextNode.id,
//           graphRecord
//         );

//         if (isGoingUp) {
//           functionsToApply.push({
//             action: currentNode.action,
//             direction: 'up',
//           });
//         } else {
//           functionsToApply.push({
//             action: nextNode.action,
//             direction: 'down',
//           });
//         }
//       }

//       functionsToApply.forEach(({ action, direction }) => {
//         if (direction === 'up') {
//           registryTracker.applyUndo(action);
//         } else {
//           registryTracker.applyDo(action);
//         }
//       });

//       const node = this.graph.nodes[id];
//       this.graph.current = node.id;
//     },
//     print() {
//       console.table(
//         Object.values(this.graph.nodes).map((d: any) =>
//           d.id === this.current.id
//             ? `(-) ${d.label} - ${d.id}`
//             : `${d.label} - ${d.id}`
//         )
//       );
//     },
//   };
// }

type TreeNode = Omit<INode, 'children' | 'name'> & {
  name: string;
  children: TreeNode[];
};

function getTreeFromNode(node: INode): TreeNode {
  return {
    ...node,
    children: node.children.map((n) => getTreeFromNode(n)),
    name: `${node.label}`,
  };
}
