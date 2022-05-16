import { ActionFunctionRegistry } from '../action-registry';
import { addNewActionNode, createProvenanceGraph, ProvenanceNode, RootNode } from '../provenance-graph';

// Move to correct place
function isRootNode(
  node: ProvenanceNode<unknown, unknown>
): node is RootNode<unknown> {
  return node.type === 'RootNode';
}

export function initializeProvenance(
  actionFunctionRegistry: ActionFunctionRegistry
) {
  const _graph = createProvenanceGraph<unknown, unknown>();
  const { registry } = actionFunctionRegistry;

  return {
    get graph() {
      return _graph;
    },
    get current() {
      return this.graph.nodes[this.graph.current];
    },
    get root(): RootNode<unknown> {
      const node = this.graph.nodes[this.graph.root];
      if (isRootNode(node)) return node;
      throw new Error('Cannot find root node');
    },
    addNewNode<K extends keyof typeof registry>(event: K, label: string) {
      const current = this.current;
      const newNode = addNewActionNode(label, current, 'Added');
      actionFunctionRegistry.registry[event]('Kiran').then(d => console.log(d));
      this.graph.nodes[newNode.id] = newNode;
      this.graph.current = newNode.id;
      return newNode;
    },
    undo() {
      const isCurrentRoot = this.current.id === this.root.id;

      if (!isCurrentRoot) {
        this.graph.current = this.current.parent;
      }
    },
    print() {
      console.table(
        Object.values(this.graph.nodes).map((d: any) =>
          d.id === this.current.id ? `(-) ${d.label}` : d.label
        )
      );
    },
  };
}
