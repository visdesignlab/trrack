// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import initProvenance from './Provenance/InitializeProvenance';

import { ProvenanceGraph } from './Interfaces/ProvenanceGraph';
import Provenance, { ActionFunction, SubscriberFunction } from './Interfaces/Provenance';
import {
  NodeMetadata,
  NodeID,
  Artifacts,
  Diff,
  isStateNode,
  isChildNode,
  isDiffNode,
  ProvenanceNode,
  StateNode,
  ChildNode,
  DiffNode,
  RootNode,
  CurrentNode,
  Nodes,
  Extra
} from './Interfaces/NodeInterfaces';

export {
  initProvenance,
  ProvenanceGraph,
  Provenance,
  ActionFunction,
  SubscriberFunction,
  NodeMetadata,
  NodeID,
  Diff,
  RootNode,
  StateNode,
  ChildNode,
  DiffNode,
  ProvenanceNode,
  isStateNode,
  isChildNode,
  isDiffNode,
  Nodes,
  CurrentNode,
  Artifacts,
  Extra
};
