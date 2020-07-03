import React from 'react';
import ReactDOM from 'react-dom';
import ProvVis from './ProvVis';
import UndoRedoButton from './UndoRedoButton';

import { ProvenanceGraph, NodeID } from '../../../../src/index';

export interface ProvVisConfig {
  height: number;
  width: number;
  sideOffset: number;
  backboneGutter: number;
  gutter: number;
  verticalSpace: number;
  regularCircleRadius: number;
  backboneCircleRadius: number;
  regularCircleStroke: number;
  backboneCircleStroke: number;
  topOffset: number;
  textSize: number;
  linkWidth: number;
  duration: number;
}

export function ProvVisCreator<T, S extends string, A>(
  node: Element,
  graph: ProvenanceGraph<T, S, A>,
  callback?: (id: NodeID) => void,
  fauxRoot: NodeID = graph.root,
  config: Partial<ProvVisConfig> = {}
) {
  ReactDOM.render(
    <ProvVis
      {...config}
      graph={graph}
      root={fauxRoot}
      changeCurrent={callback}
      current={graph.current}
      nodeMap={graph.nodes}
    />,
    node
  );
}

export function UndoRedoButtonCreator<T, S extends string, A>(
  node: Element,
  graph: ProvenanceGraph<T, S, A>,
  undoCallback: () => void,
  redoCallback: () => void
) {
  ReactDOM.render(
    <UndoRedoButton
      graph={graph}
      undoCallback={undoCallback}
      redoCallback={redoCallback}
    />,
    node
  );
}
