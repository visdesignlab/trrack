import {
  isChildNode,
  Nodes,
  ProvenanceNode,
  NodeID,
} from '@visdesignlab/trrack';
import { HierarchyNode, stratify } from 'd3';
import { useMemo } from 'react';
import { treeLayout } from '../Utils/TreeLayout';

export type StratifiedList<T, S, A> = HierarchyNode<ProvenanceNode<S, A>>[];

export type StratifiedMap<T, S, A> = {
  [key: string]: HierarchyNode<ProvenanceNode<S, A>> & { width?: number };
};

export function useComputeNodePosition<T, S extends string, A>(
  nodeMap: Nodes<S, A>,
  current: NodeID,
  root: NodeID
) {
  const { stratifiedMap, links } = useMemo(() => {
    const nodeList = Object.values(nodeMap);

    const strat = stratify<ProvenanceNode<S, A>>()
      .id((d) => d.id)
      .parentId((d) => {
        if (d.id === root) return null;

        if (isChildNode(d)) {
          return d.parent;
        }
        return null;
      });

    const stratifiedTree = strat(nodeList);

    const stratifiedList: StratifiedList<T, S, A> =
      stratifiedTree.descendants();
    const innerMap: StratifiedMap<T, S, A> = {};

    stratifiedList.forEach((c) => {
      innerMap[c.id!] = c;
    });

    treeLayout(innerMap, current, root);
    return { stratifiedMap: innerMap, links: stratifiedTree.links() };
  }, [current, root, nodeMap]);

  return { stratifiedMap: stratifiedMap, links: links };
}
