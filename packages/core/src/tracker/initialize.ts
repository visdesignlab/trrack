import { ActionFunctionRegistryTracker } from '../action/registry/tracker';
import { Action } from '../action/types';
import {
  ActionNode,
  addNewActionNode,
  createProvenanceGraph,
  getPathToNode,
  isNextNodeUp,
  ProvenanceGraph,
  ProvenanceNode,
  RootNode,
} from '../graph';

// Move to correct place
function isRootNode(node: ProvenanceNode): node is RootNode {
  return node.type === 'RootNode';
}

type AdjacencyList = { [key: string]: string[] };

export type GraphTraversalRecord = {
  adjacencyList: AdjacencyList;
  levelList: { [key: string]: number };
  parentList: { [key: string]: string };
};

export function initializeTrrack(
  registryTracker: ActionFunctionRegistryTracker
) {
  const _graph = createProvenanceGraph();

  // Setup for easy traversal in future
  const graphRecord: GraphTraversalRecord = {
    adjacencyList: {
      [_graph.root]: [],
    },
    levelList: {
      [_graph.root]: 0,
    },
    parentList: {
      [_graph.root]: 'None',
    },
  };

  return {
    get graph() {
      return _graph;
    },
    get current() {
      return this.graph.nodes[this.graph.current];
    },
    get root(): RootNode {
      const node = this.graph.nodes[this.graph.root];
      if (isRootNode(node)) return node;
      throw new Error('Cannot find root node');
    },
    applyAction(action: Action, skipFirst: boolean = false) {
      const results = skipFirst ? null : registryTracker.applyDo(action);

      const newNode = addNewActionNode(
        action.label,
        action,
        this.current,
        results
      );

      console.log(newNode.results);

      graphRecord.adjacencyList[newNode.id] = [this.current.id];
      graphRecord.adjacencyList[this.current.id].push(newNode.id);

      graphRecord.levelList[newNode.id] =
        graphRecord.levelList[this.current.id] + 1;

      graphRecord.parentList[newNode.id] = this.current.id;

      this.graph.nodes[newNode.id] = newNode;
      this.graph.current = newNode.id;

      return results;
    },
    undo() {
      if (!isRootNode(this.current)) {
        registryTracker.applyUndo(this.current.action);
        this.graph.current = this.current.parent;
      }
    },
    redo() {
      if (this.current.children.length === 0) return;

      const nextNode = this.graph.nodes[
        this.current.children[this.current.children.length - 1]
      ] as ActionNode;
      registryTracker.applyDo(nextNode.action);
      this.graph.current = nextNode.id;
    },
    get tree() {
      return getTreeFromNode(this.graph, this.root);
    },
    goToNode(id: string) {
      if (!this.graph.nodes[id])
        throw new Error(`Node with id ${id} not found.`);

      const path = getPathToNode(this.graph.current, id, graphRecord);

      const functionsToApply: {
        action: Action;
        direction: 'up' | 'down';
      }[] = [];

      for (let i = 0; i < path.length - 1; ++i) {
        const currentNode = this.graph.nodes[path[i]] as ActionNode;
        const nextNode = this.graph.nodes[path[i + 1]] as ActionNode;

        const isGoingUp = isNextNodeUp(
          currentNode.id,
          nextNode.id,
          graphRecord
        );

        if (isGoingUp) {
          functionsToApply.push({
            action: currentNode.action,
            direction: 'up',
          });
        } else {
          functionsToApply.push({
            action: nextNode.action,
            direction: 'down',
          });
        }
      }

      functionsToApply.forEach(({ action, direction }) => {
        if (direction === 'up') {
          registryTracker.applyUndo(action);
        } else {
          registryTracker.applyDo(action);
        }
      });

      const node = this.graph.nodes[id];
      this.graph.current = node.id;
    },
    print() {
      console.table(
        Object.values(this.graph.nodes).map((d: any) =>
          d.id === this.current.id
            ? `(-) ${d.label} - ${d.id}`
            : `${d.label} - ${d.id}`
        )
      );
    },
  };
}

export type Trrack = ReturnType<typeof initializeTrrack>;

type TreeNode = Omit<ProvenanceNode, 'children' | 'name'> & {
  name: string;
  children: TreeNode[];
};

function getTreeFromNode(
  graph: ProvenanceGraph,
  node: ProvenanceNode
): TreeNode {
  return {
    ...node,
    children: node.children.map(id => getTreeFromNode(graph, graph.nodes[id])),
    name: `${node.label}`,
  };
}
