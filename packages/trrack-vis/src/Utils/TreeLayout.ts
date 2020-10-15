import { HierarchyNode } from 'd3';
import { ProvenanceNode } from '@visdesignlab/trrack';
import { StratifiedMap } from '../components/ProvVis';

export type TreeNode = HierarchyNode<unknown>;

export interface ExtendedHierarchyNode<T, S, A> extends HierarchyNode<ProvenanceNode<T, S, A>> {
  column: number;
}

export type ExtendedStratifiedMap<T, S, A> = {
  [key: string]: ExtendedHierarchyNode<T, S, A>;
};

export function treeLayout<T, S, A>(nodes: StratifiedMap<T, S, A>, current: string, root: string) {
  const depthMap: { [key: string]: any } = {};

  const currentPath = getPathTo(nodes, root, current);

  DFS(nodes, root, depthMap, currentPath);

  return currentPath;
}

function DFS<T, S, A>(
  nodes: StratifiedMap<T, S, A>,
  node: string,
  depthMap: any,
  currentPath: string[],
) {
  const explored = new Set();

  const toExplore = [];

  let currDepth = 0;

  toExplore.push(nodes[node]);

  while (toExplore.length > 0) {
    const temp: any = toExplore.pop();

    if (!explored.has(temp.id)) {
      temp.width = currDepth;
      depthMap[temp.id] = temp.width;
      explored.add(temp.id);
    } else {
      temp.width = depthMap[temp.id];
    }

    if (temp.children) {
      toExplore.push(
        ...temp.children.sort((a: any, b: any) => {
          const aIncludes = currentPath.includes(a.id) ? 1 : 0;
          const bIncludes = currentPath.includes(b.id) ? 1 : 0;
          return aIncludes - bIncludes;
        }),
      );
    } else {
      currDepth += 1;
    }
  }
}

export function getPathTo<T, S, A>(
  nodes: StratifiedMap<T, S, A>,
  from: string,
  to: string,
): string[] {
  const path: string[] = [];

  search(nodes, from, to, path);

  return [from, ...path.reverse()];
}

function search<T, S, A>(
  nodes: StratifiedMap<T, S, A>,
  node: string,
  final: string,
  path: string[],
) {
  if (!nodes[node]) return false;

  if (node === final) {
    path.push(node);
    return true;
  }

  const children = nodes[node].children || [];

  // eslint-disable-next-line no-restricted-syntax
  for (const child of children) {
    if (search(nodes, child.id!, final, path)) {
      path.push(child.id!);
      return true;
    }
  }

  return false;
}
