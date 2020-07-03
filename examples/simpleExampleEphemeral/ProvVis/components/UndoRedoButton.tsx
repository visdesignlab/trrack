
import { isStateNode, isChildNode, NodeID, Nodes, ProvenanceGraph, ProvenanceNode, StateNode } from '../../../../src/index';
import { HierarchyNode, stratify } from 'd3';
import React, { ReactChild, useEffect, useState } from 'react';
import { NodeGroup } from 'react-move';
import { Popup } from 'semantic-ui-react';
import { style } from 'typestyle';

import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import findBundleParent from '../Utils/findBundleParent';
import translate from '../Utils/translate';
import { treeLayout } from '../Utils/TreeLayout';
import BackboneNode from './BackboneNode';
import bundleTransitions from './BundleTransitions';
import Link from './Link';
import linkTransitions from './LinkTransitions';
import nodeTransitions from './NodeTransitions';
import { treeColor } from './Styles';

import {Button} from 'semantic-ui-react';

export interface UndoRedoConfig<T, S extends string, A> {
  graph: ProvenanceGraph<T, S, A>;
  undoCallback: () => void;
  redoCallback: () => void;
}

function UndoRedoButton<T, S extends string, A>({
  graph,
  undoCallback,
  redoCallback
} : UndoRedoConfig<T, S, A> ) {
  const isAtRoot = graph.root === graph.current;
  const isAtLatest = graph.nodes[graph.current].children.length === 0;

  return (
   <Button.Group size="large">
     <Button
       icon="undo"
       primary
       content="Undo"
       disabled={isAtRoot}
       onClick={undoCallback}></Button>
     <Button.Or></Button.Or>
     <Button
       icon="redo"
       secondary
       content="Redo"
       disabled={isAtLatest}
       onClick={redoCallback}></Button>
   </Button.Group>
 );
}

export default UndoRedoButton;
