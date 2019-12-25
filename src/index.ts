// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import initProvenance from './Provenance/InitializeProvenance';
import { ProvenanceGraph } from './Interfaces/ProvenanceGraph';
import { ActionFunction } from './Interfaces/Provenance';

export { initProvenance, ProvenanceGraph, ActionFunction };
