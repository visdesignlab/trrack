import React from 'react';
import ReactDOM from 'react-dom';
import ProvVis from './ProvVis';
import UndoRedoButton from './UndoRedoButton';

import { Provenance, ProvenanceGraph, NodeID } from '../../../../src/index';

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
  prov: Provenance<T, S, A>,
  callback?: (id: NodeID) => void,
  buttons: boolean = true,
  ephemeralUndo: boolean = false,
  fauxRoot: NodeID = prov.graph().root,
  config: Partial<ProvVisConfig> = {}
) {
  ReactDOM.render(
    <ProvVis
      {...config}
      root={fauxRoot}
      changeCurrent={callback}
      current={prov.graph().current}
      nodeMap={prov.graph().nodes}
      prov={prov}
      undoRedoButtons={true}
      ephemeralUndo={ephemeralUndo}
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
