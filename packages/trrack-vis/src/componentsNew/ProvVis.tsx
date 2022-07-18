import { NodeID, Nodes, Provenance, StateNode } from '@visdesignlab/trrack';
import React, { ReactChild, useMemo } from 'react';
import { BundleMap } from '../Utils/BundleMap';
import { IconConfig } from '../Utils/IconConfig';
import { Tree } from './Tree';
import { useComputeNodePosition } from './useComputeNodePosition';

interface ProvVisProps<T, S extends string, A> {
  root: NodeID;
  currentNode: NodeID;
  nodeMap: Nodes<S, A>;
  config?: Partial<ProvVisConfig<S, A>>;
}

export interface ProvVisConfig<S extends string, A> {
  gutter: number;
  verticalSpace: number;
  marginTop: number;
  marginLeft: number;
  animationDuration: number;
  annotationHeight: number;
  nodeAndLabelGap: number;
  labelWidth: number;
  iconConfig: IconConfig<S, A> | null;
  changeCurrent: (id: NodeID) => void;
  bookmarkNode: (id: NodeID) => void;
  annotateNode: (id: NodeID, annotation: string) => void;
}

const defaultConfig: ProvVisConfig<any, any> = {
  gutter: 25,
  verticalSpace: 50,
  marginTop: 50,
  marginLeft: 50,
  animationDuration: 500,
  annotationHeight: 150,
  nodeAndLabelGap: 20,
  labelWidth: 150,
  iconConfig: null,
  changeCurrent: () => null,
  bookmarkNode: () => null,
  annotateNode: () => null,
};

export function ProvVis<T, S extends string, A>({
  nodeMap,
  root,
  currentNode,
  config,
}: ProvVisProps<T, S, A>) {
  const { stratifiedMap: nodePositions, links } = useComputeNodePosition(
    nodeMap,
    currentNode,
    root
  );

  const mergedConfig = useMemo(() => {
    return { ...defaultConfig, ...config };
  }, []);

  return (
    <Tree
      nodes={nodePositions}
      links={links}
      config={mergedConfig}
      currentNode={currentNode}
    />
  );
}
