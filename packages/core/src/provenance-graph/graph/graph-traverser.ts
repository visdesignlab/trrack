import { GraphNode } from './types';

export function findPathToTargetNode<ID>(
  currentNode: GraphNode<ID>,
  targetNode: GraphNode<ID>
) {
  console.log({ currentNode, targetNode });
}
