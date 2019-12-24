import Provenance, {
  ActionFunction,
  SubscriberFunction,
  ExportedState
} from '../Interfaces/Provenance';
import deepCopy from '../Utils/DeepCopy';
import { ProvenanceGraph } from '../Interfaces/ProvenanceGraph';
import {
  NodeID,
  NodeMetadata,
  Artifacts,
  RootNode,
  isStateNode
} from '../Interfaces/NodeInterfaces';
import {
  createProvenanceGraph,
  applyActionFunction,
  goToNode,
  importState
} from './ProvenanceGraphFunction';
import { initEventManager } from '../Utils/EventManager';
const decompressFromEncodedURIComponent = require('lz-string').decompressFromEncodedURIComponent;
const compressToEncodedURIComponent = require('lz-string').compressToEncodedURIComponent;

export default function initProvenance<T>(
  initialState: T,
  loadFromUrl: boolean = false
): Provenance<T> {
  let graph = createProvenanceGraph(initialState);

  const initalStateRecord = deepCopy(initialState) as any;

  const EM = initEventManager<T>();

  const surroundChars = '||';

  function loadUrl() {
    if (!window || !window.location || !window.location.href) {
      throw new Error(
        'Window and/or location not defined. Make sure this is a browser environment.'
      );
    }
    const url = window.location.href;

    if (!url.includes('||')) {
      return;
    }

    const importString = url.split('||').reverse()[0];
    const importedState = JSON.parse(decompressFromEncodedURIComponent(importString)) as T;

    importStateAndAddNode(importedState);
  }

  function triggerEvents() {
    const currentState = graph.nodes[graph.current];
    if (isStateNode(currentState)) {
      EM.callEvents(currentState.artifacts.diffs || [], currentState.state);
    }
  }

  function importStateAndAddNode(state: T) {
    graph = importState(graph, initalStateRecord, state);
  }

  return {
    graph: () => deepCopy(graph),
    current: () => deepCopy(graph.nodes[graph.current]),
    root: () => deepCopy(graph.nodes[graph.root] as RootNode<T>),
    applyAction: (
      label: string,
      action: ActionFunction<T>,
      args?: any[],
      metadata?: NodeMetadata,
      artifacts?: Artifacts
    ) => {
      graph = applyActionFunction(graph, label, action, args, metadata, artifacts);
      triggerEvents();
      return graph.nodes[graph.current].state;
    },

    goToNode: (id: NodeID) => {
      graph = goToNode(graph, id);
      triggerEvents();
    },
    goBackOneStep: () => {
      const current = graph.nodes[graph.current];
      if (isStateNode(current)) {
        graph = goToNode(graph, current.parent);
      } else {
        throw new Error('Already at root');
      }
      triggerEvents();
    },
    goBackNSteps: (n: number) => {
      const num = n;
      let tempGraph: ProvenanceGraph<T> = deepCopy(graph);
      while (n > 0) {
        let current = tempGraph.nodes[graph.current];
        if (isStateNode(current)) {
          tempGraph = goToNode(graph, current.parent);
        } else {
          throw new Error(`Cannot go back ${num} steps. Reached root after ${num - n} steps`);
        }
        n--;
      }
      graph = tempGraph;
      triggerEvents();
    },
    goForwardOneStep: () => {
      let current = graph.nodes[graph.current];
      if (current.children.length > 0) {
        graph = goToNode(graph, current.children.reverse()[0]);
      } else {
        throw new Error('Already at the latest node in this branch');
      }

      triggerEvents();
    },

    reset: () => {
      graph = goToNode(graph, graph.root);
      triggerEvents();
    },
    done: () => {
      if (loadFromUrl) {
        loadUrl();
        triggerEvents();
      }
    },

    addObserver: (propPath: string[], func: SubscriberFunction<T>) => {
      const state = graph.nodes[graph.current].state as any;
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

    exportState: (partial: boolean = false) => {
      let exportedState: Partial<T> = {};
      const currentState = graph.nodes[graph.current].state as any;

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

      return `${surroundChars}${compressedString}`;
    },
    importState: (importString: string) => {
      const importedStates: ExportedState<T> = JSON.parse(
        decompressFromEncodedURIComponent(importString.replace('||', ''))
      );
      const state = { ...graph.nodes[graph.current].state, ...importedStates };
      importStateAndAddNode(state);
      triggerEvents();
    },

    exportProvenanceGraph: () => graph,
    importProvenanceGraph: (graph: ProvenanceGraph<T>) => console.log(graph)
  };
}
