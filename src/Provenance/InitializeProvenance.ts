const applyChange = require('deep-diff').applyChange;

import 'firebase/database';
import 'firebase/firestore';

import firebase from 'firebase/app';

import Provenance, {
  ActionFunction,
  SubscriberFunction,
  ExportedState,
  ArtifactSubscriberFunction
} from '../Interfaces/Provenance';
import deepCopy from '../Utils/DeepCopy';
import { ProvenanceGraph } from '../Interfaces/ProvenanceGraph';
import { logToFirebase, initializeFirebase } from './FirebaseFunctions';

import { Action } from '../Interfaces/ActionObject';

import {
  NodeID,
  NodeMetadata,
  StateNode,
  Diff,
  Artifacts,
  RootNode,
  isStateNode,
  isChildNode,
  isDiffNode
} from '../Interfaces/NodeInterfaces';
import {
  createProvenanceGraph,
  applyActionFunction,
  goToNode,
  importState,
  addExtraToNodeArtifact,
  addAnnotationToNode,
  getExtraFromArtifact
} from './ProvenanceGraphFunction';
import { initEventManager } from '../Utils/EventManager';
import deepDiff from '../Utils/DeepDiff';
const decompressFromEncodedURIComponent = require('lz-string').decompressFromEncodedURIComponent;
const compressToEncodedURIComponent = require('lz-string').compressToEncodedURIComponent;

export default function initProvenance<T, S, A>(
  initialState: T,
  loadFromUrl: boolean = true,
  storeFirebase: boolean = false,
  firebaseConfig?: any
): Provenance<T, S, A> {
  let graph = createProvenanceGraph<T, S, A>(initialState);

  const initalStateRecord = deepCopy(initialState) as any;

  const EM = initEventManager<T, S, A>();

  const surroundChars = '||';

  let store = undefined;
  let log: (graph: ProvenanceGraph<T, S, A>) => void;

  if (storeFirebase && firebaseConfig) {
    store = initializeFirebase(firebaseConfig);
    log = logToFirebase(store?.db);
  }

  function loadUrl() {
    if (!window || !window.location || !window.location.href) {
      throw new Error(
        'Please use in a browser environment, or set loadFromUrl parameter in initProvenance to false'
      );
    }

    const url = new URL(window.location.href);

    const params = new URLSearchParams(url.search);

    if (params.get('provState') === null) {
      return;
    }

    const importString = params.get('provState');

    const importedState = JSON.parse(decompressFromEncodedURIComponent(importString));

    importStateAndAddNode(importedState as T);
  }

  function curr() {
    return graph.nodes[graph.current];
  }

  function triggerEvents(oldState: T) {
    const currentState = graph.nodes[graph.current].getState();
    const diffs = deepDiff(oldState, currentState);

    EM.callEvents(diffs || [], currentState, curr());
  }

  function importStateAndAddNode(state: T, newLabel?: string, newMetadata?: NodeMetadata<S>) {
    graph = importState(graph, initalStateRecord, state);
    if (newLabel !== undefined) {
      graph.nodes[graph.current].label = newLabel;
    }
    if (newMetadata !== undefined) {
      graph.nodes[graph.current].metadata = newMetadata;
    }
  }

  function addStateToURL(stateString: string) {
    if (!loadFromUrl) {
      return;
    }
    const url = new URL(window.location.href);

    const params = new URLSearchParams(url.search);

    const importString = params.delete('provState');
    params.set('provState', stateString);

    window.history.replaceState({}, '', `${url.pathname}?${params}`);
  }

  function createStateString(partial: boolean): string {
    let exportedState: Partial<T> = {};
    const currentState = graph.nodes[graph.current].getState() as any;

    if (partial) {
      Object.keys(currentState).forEach(key => {
        const prev = initalStateRecord[key];
        const curr = currentState[key];
        if (JSON.stringify(prev) !== JSON.stringify(curr)) {
          exportedState = { ...exportedState, [key]: currentState[key] };
        }
      });
    } else {
      exportedState = { ...currentState };
    }

    const exportedStateObject: ExportedState<T> = exportedState;
    const compressedString = compressToEncodedURIComponent(JSON.stringify(exportedStateObject));

    return `${compressedString}`;
  }

  return {
    graph: () => deepCopy(graph),
    current: () => deepCopy(graph.nodes[graph.current]),
    root: () => deepCopy(graph.nodes[graph.root] as RootNode<T, S>),
    addAction(label: string, action: ActionFunction<T>) {
      const a = new Action<T, S, A>(label, action, this);
      return a;
    },
    applyAction: (
      label: string,
      action: ActionFunction<T>,
      args?: any[],
      metadata: NodeMetadata<S> = {},
      artifacts?: Artifacts<A>,
      eventType?: S,
      complex: boolean = false,
      ephemeral: boolean = false
    ) => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());

      if (eventType) {
        metadata.type = eventType;
      }

      graph = applyActionFunction(
        graph,
        label,
        action,
        complex,
        ephemeral,
        args,
        metadata,
        artifacts
      );
      triggerEvents(oldState);

      addStateToURL(createStateString(false));
      if (storeFirebase) {
        log(graph);
      }
      return graph.nodes[graph.current].getState();
    },
    goToNode: (id: NodeID) => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      graph = goToNode(graph, id);
      triggerEvents(oldState);
      addStateToURL(createStateString(false));
    },
    addExtraToNodeArtifact: (id: NodeID, extra: A) => {
      graph = addExtraToNodeArtifact(graph, id, extra);
      EM.callEvents([], graph.nodes[id].getState(), graph.nodes[id]);
    },
    addAnnotationToNode: (id: NodeID, annotation: string) => {
      graph = addAnnotationToNode(graph, id, annotation);
      EM.callEvents([], graph.nodes[id].getState(), graph.nodes[id]);
    },
    getExtraFromArtifact: (id: NodeID) => {
      return getExtraFromArtifact<T, S, A>(graph, id);
    },
    goBackOneStep: () => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      const current = graph.nodes[graph.current];
      if (isChildNode(current)) {
        graph = goToNode(graph, current.parent);
      } else {
        throw new Error('Already at root');
      }
      triggerEvents(oldState);

      addStateToURL(createStateString(false));
    },
    goBackNSteps: (n: number) => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      const num = n;
      let tempGraph: ProvenanceGraph<T, S, A> = deepCopy(graph) as any;
      while (n > 0) {
        let current = tempGraph.nodes[tempGraph.current];
        if (isChildNode(current)) {
          tempGraph = goToNode(graph, current.parent) as any;
        } else {
          throw new Error(`Cannot go back ${num} steps. Reached root after ${num - n} steps`);
        }
        n--;
      }
      graph = tempGraph;
      triggerEvents(oldState);
      addStateToURL(createStateString(false));
    },
    goBackToNonEphemeral: () => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      let tempGraph: ProvenanceGraph<T, S, A> = deepCopy(graph) as any;
      let currNode = tempGraph.nodes[tempGraph.current];
      while (true) {
        if (isChildNode(currNode)) {
          tempGraph = goToNode(graph, currNode.parent) as any;
          if (!tempGraph.nodes[tempGraph.current].ephemeral) {
            break;
          }
          currNode = tempGraph.nodes[tempGraph.current];
        } else {
          tempGraph = goToNode(tempGraph, tempGraph.root);
          break;
        }
      }
      graph = tempGraph;
      triggerEvents(oldState);
      addStateToURL(createStateString(false));
    },
    goForwardToNonEphemeral: () => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      let tempGraph: ProvenanceGraph<T, S, A> = deepCopy(graph) as any;
      let currNode = tempGraph.nodes[tempGraph.current];
      while (true) {
        if (currNode.children.length > 0) {
          tempGraph = goToNode(tempGraph, currNode.children.reverse()[0]) as any;

          if (!tempGraph.nodes[tempGraph.current].ephemeral) {
            break;
          }

          currNode = tempGraph.nodes[tempGraph.current];
        } else {
          throw new Error(
            'Already at the latest node in this branch or no non ephemeral nodes later'
          );
        }
      }
      graph = tempGraph;
      triggerEvents(oldState);
      addStateToURL(createStateString(false));
    },
    goForwardOneStep: () => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      let current = graph.nodes[graph.current];
      if (current.children.length > 0) {
        graph = goToNode(graph, current.children.reverse()[0]);
      } else {
        throw new Error('Already at the latest node in this branch');
      }

      triggerEvents(oldState);
      addStateToURL(createStateString(false));
    },
    reset: () => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      graph = goToNode(graph, graph.root);
      triggerEvents(oldState);
      addStateToURL(createStateString(false));
    },
    done: () => {
      if (loadFromUrl) {
        const oldState = deepCopy(graph.nodes[graph.current].getState());
        loadUrl();
        triggerEvents(oldState);
      }
    },
    addObserver: (propPath: string[], func: SubscriberFunction<T>) => {
      const state = graph.nodes[graph.current].getState() as any;
      let path = state;

      propPath.forEach((prop: string) => {
        const keys = Object.keys(path);
        if (!keys.includes(prop)) throw new Error(`Path ${propPath.join('.')} does not exist`);
        path = path[prop];
      });

      EM.addObserver(propPath, func);
    },
    addGlobalObserver: (func: SubscriberFunction<T>) => {
      EM.addGlobalObserver(func);
    },
    addArtifactObserver: (func: ArtifactSubscriberFunction<A>) => {
      EM.addArtifactObserver(func);
    },
    exportState: (partial: boolean = false) => {
      return createStateString(partial);
    },
    importState: (importString: string) => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      const importedStates: ExportedState<T> = JSON.parse(
        decompressFromEncodedURIComponent(importString.replace('||', ''))
      );
      const state = { ...graph.nodes[graph.current].getState(), ...importedStates };
      importStateAndAddNode(state);
      triggerEvents(oldState);
    },
    importLinearStates: (states: T[], labels?: string[], metadata?: NodeMetadata<S>[]) => {
      for (let j = 0; j < states.length; j++) {
        const oldState = deepCopy(graph.nodes[graph.current].getState());
        if (labels !== undefined && metadata !== undefined) {
          importStateAndAddNode(states[j], labels[j], metadata[j]);
        } else {
          importStateAndAddNode(states[j]);
        }
        triggerEvents(oldState);
      }
    },
    exportProvenanceGraph: () => JSON.stringify(graph),
    getDiffFromNode: (id: NodeID) => {
      let node = graph.nodes[id];

      if (isChildNode(node)) {
        return deepDiff(graph.nodes[node.parent].getState(), node.getState());
      } else {
        throw new Error(`Cannot get diff from root node`);
        return [];
      }
    },
    importProvenanceGraph: (importString: string) => {
      const oldState = deepCopy(graph.nodes[graph.current].getState());
      graph = JSON.parse(importString);

      for (let c in graph.nodes) {
        let curr = graph.nodes[c];

        if (!isDiffNode(curr)) {
          let state = deepCopy(curr.state);
          curr.getState = () => {
            return state;
          };
        } else {
          let _state = (graph.nodes[curr.lastStateNode] as StateNode<T, S, A>).state;
          let state: T = deepCopy(_state);

          let diffsTemp = curr.diffs;

          if (diffsTemp.length === 0) {
            return state;
          }

          diffsTemp.forEach((diff: Diff) => {
            applyChange(state, null, diff);
          });

          return state;
        }
      }

      triggerEvents(oldState);
    }
  };
}
