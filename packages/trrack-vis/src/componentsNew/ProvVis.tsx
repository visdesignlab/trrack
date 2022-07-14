import {
  DiffNode,
  isChildNode,
  NodeID,
  Nodes,
  Provenance,
  ProvenanceNode,
  StateNode,
} from '@visdesignlab/trrack';
import {
  HierarchyNode,
  Numeric,
  stratify,
  symbol,
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye,
} from 'd3';
import React, { ReactChild, useEffect, useState, useMemo } from 'react';
import { NodeGroup } from 'react-move';
import { Popup, Tab } from 'semantic-ui-react';
import { style } from 'typestyle';
import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import findBundleParent from '../Utils/findBundleParent';
import translate from '../Utils/translate';
import { treeLayout } from '../Utils/TreeLayout';
import { Tree } from './Tree';
import { useComputeNodePosition } from './useComputeNodePosition';

interface ProvVisProps<T, S extends string, A> {
  root: NodeID;
  current: NodeID;
  nodeMap: Nodes<S, A>;
  bundleMap?: BundleMap;
  config?: Partial<ProvVisConfig>;
  eventConfig?: EventConfig<S>;
  changeCurrent?: (id: NodeID) => void;
  popupContent?: (nodeId: StateNode<S, A>) => ReactChild;
  annotationContent?: (nodeId: StateNode<S, A>) => ReactChild;
  prov?: Provenance<T, S, A>;
  ephemeralUndo?: boolean;
}

export interface ProvVisConfig {
  backboneGutter: number;
  gutter: number;
  verticalSpace: number;
  marginTop: number;
  marginLeft: number;
  animationDuration: number;
  nodeAndLabelGap: number;
  labelWidth: number;
}

const defaultConfig: ProvVisConfig = {
  gutter: 15,
  backboneGutter: 20,
  verticalSpace: 50,
  marginTop: 50,
  marginLeft: 50,
  animationDuration: 500,
  nodeAndLabelGap: 20,
  labelWidth: 150,
};

export function ProvVis<T, S extends string, A>({
  nodeMap,
  root,
  current,
  changeCurrent,
  config,
  bundleMap = {},
  eventConfig,
  popupContent,
  annotationContent,
  prov,
}: ProvVisProps<T, S, A>) {
  const { stratifiedMap: nodePositions, links } = useComputeNodePosition(
    nodeMap,
    current,
    root
  );

  const mergedConfig = useMemo(() => {
    return { ...defaultConfig, ...config };
  }, []);

  console.log(nodePositions);

  return (
    <Tree
      nodes={nodePositions}
      changeCurrent={changeCurrent}
      links={links}
      config={mergedConfig}
    />
  );
}
