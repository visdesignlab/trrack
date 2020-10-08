import {
  configure, observable, reaction, toJS, action,
} from 'mobx';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import {
  applyActionFunction,
  createProvenanceGraph,
  goToNode,
  importState,
  updateMobxObservable,
} from './ProvenanceGraphFunction';
import {
  NodeID,
  RootNode,
  isChildNode,
  ProvenanceNode,
  getState,
} from '../Types/Nodes';
import { Provenance } from '../Types/Provenance';
import { ActionObject } from '../Types/Action';
import {
  GlobalObserver,
  ObserverEffect,
  ObserverExpression,
} from '../Types/Observers';
import generateTimeStamp from '../Utils/generateTimeStamp';
import { ProvenanceGraph } from '../Types/ProvenanceGraph';

type ProvenanceOpts = {
  loadFromUrl: boolean;
  firebaseOpts: {
    storeOnFirebase: boolean;
    config: any;
  };
};

configure({ enforceActions: 'always' });

export default function initProvenance<T, S, A = void>(
  initialState: T,
  opts: Partial<ProvenanceOpts> = {
    loadFromUrl: true,
    firebaseOpts: { storeOnFirebase: false, config: null },
  },
): Provenance<T, S, A> {
  const { loadFromUrl, firebaseOpts } = opts;

  let setupFinished: boolean = false;
  const state = observable(initialState);
  const graph = observable(createProvenanceGraph<T, S, A>(toJS(state)));

  const PROVSTATEKEY = 'provState';

  if (firebaseOpts?.storeOnFirebase) {
    if (!firebaseOpts?.config) throw new Error('Firebase config is not provided.');
  }

  if (loadFromUrl) {
    reaction(
      () => toJS(state),
      (st) => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const stateEncodedString = compressToEncodedURIComponent(
          JSON.stringify(st),
        );
        params.set(PROVSTATEKEY, stateEncodedString);
      },
    );
  }

  return {
    get state() {
      return toJS(state);
    },
    get graph() {
      return toJS(graph);
    },
    get current() {
      return toJS(graph.nodes[graph.current]);
    },
    get root() {
      return toJS(graph.nodes[graph.root] as RootNode<T, S>);
    },
    apply(act: ActionObject<T, S>) {
      if (!setupFinished) {
        throw new Error(
          'Provenance setup not finished. Please call done function on provenance object after setting up any observers.)',
        );
      }
      applyActionFunction(graph, act, state);
    },
    addGlobalObserver(observer: GlobalObserver<T, S, A>) {
      reaction(
        () => toJS(graph),
        (g) => observer(g),
      );
    },
    addObserver(expression: ObserverExpression<T>, effect: ObserverEffect<T>) {
      reaction(
        () => expression(toJS(state)),
        () => {
          effect(toJS(state));
        },
      );
    },
    goToNode(id: NodeID) {
      goToNode(graph, state, id);
    },
    addArtifact: action((id: NodeID, artifact: A) => {
      const node = graph.nodes[id];
      if (isChildNode(node)) {
        node.artifacts.extra.push({
          time: generateTimeStamp(),
          e: artifact,
        });
      }
    }),
    addAnnotation(id: NodeID, annotation: string) {
      const node = graph.nodes[id];
      if (isChildNode(node)) {
        node.artifacts.annotation = annotation;
      }
    },
    goBackOneStep() {
      const current = graph.nodes[graph.current];
      if (!isChildNode(current)) throw new Error('Already at root');
      goToNode(graph, state, current.parent);
    },
    goForwardOneStep(to: 'latest' | 'oldest' = 'latest') {
      const current = graph.nodes[graph.current];
      if (current.children.length === 0) throw new Error('Already at latest node in this branch');
      if (to === 'oldest') goToNode(graph, state, current.children[0]);
      else goToNode(graph, state, current.children[current.children.length - 1]);
    },
    goBackToNonEphemeral() {
      let parent: NodeID | null = null;
      const current = graph.nodes[graph.current];
      if (isChildNode(current)) {
        parent = current.parent;

        while (graph.nodes[parent].actionType === 'Ephemeral') {
          const parentNode: ProvenanceNode<T, S, A> = graph.nodes[parent];
          if (!isChildNode(parentNode)) break;
          parent = parentNode.parent;
        }

        goToNode(graph, state, parent);
      }
    },
    goForwardToNonEphemeral(to: 'latest' | 'oldest' = 'latest') {
      let child: NodeID | null = null;
      const current = graph.nodes[graph.current];

      if (current.children.length === 0) throw new Error('Already at latest node.');
      child = current.children[to === 'latest' ? current.children.length - 1 : 0];

      while (graph.nodes[child].actionType === 'Ephemeral') {
        const childNode: ProvenanceNode<T, S, A> = graph.nodes[child];
        if (childNode.children.length === 0) break;
        child = childNode.children[
          to === 'latest' ? childNode.children.length - 1 : 0
        ];
      }

      goToNode(graph, state, child);
    },
    reset() {
      goToNode(graph, state, graph.root);
    },
    setBookmark: action((id: NodeID, bookmark: boolean) => {
      graph.nodes[id].bookmarked = bookmark;
    }),
    getBookmark(id: NodeID) {
      return graph.nodes[id].bookmarked;
    },
    exportState(partial: boolean = false) {
      let exportedState: Partial<T> = {};
      const currentState = getState(graph, graph.nodes[graph.current]);

      if (partial) {
        Object.keys(initialState).forEach((k) => {
          const key: Extract<keyof T, string> = k as any;
          const prev = initialState[key];
          const curr = currentState[key];
          if (JSON.stringify(prev) !== JSON.stringify(curr)) {
            exportedState = { ...exportedState, [key]: currentState[key] };
          }
        });
      } else {
        exportedState = currentState;
      }

      const compressedString = compressToEncodedURIComponent(
        JSON.stringify(exportedState),
      );

      return compressedString;
    },
    importState(s: string | Partial<T>) {
      let st: T;
      if (typeof s === 'string') st = JSON.parse(decompressFromEncodedURIComponent(s) || '') as any;
      else st = { ...toJS(state), ...s };

      updateMobxObservable(state, st);
      importState(graph, st);
    },
    importProvenanceGraph(g: string | ProvenanceGraph<T, S, A>) {
      let gg: ProvenanceGraph<T, S, A>;
      if (typeof g === 'string') {
        gg = JSON.parse(g) as ProvenanceGraph<T, S, A>;
      } else {
        gg = g;
      }
      updateMobxObservable(graph, gg);
    },
    exportProvenanceGraph() {
      return JSON.stringify(toJS(graph));
    },
    getState(node: ProvenanceNode<T, S, A>) {
      return getState(graph, node);
    },
    done() {
      setupFinished = true;
      if (loadFromUrl) {
        if (!window?.location?.href) {
          throw new Error(
            'loadFromUrl option can only be used in a browser environment',
          );
        }

        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const importString = params.get(PROVSTATEKEY);
        if (!importString) return;
        let importedState: T = JSON.parse(
          decompressFromEncodedURIComponent(importString) || '',
        ) as any;

        importedState = { ...toJS(state), ...importedState };

        importState(graph, importedState);
        updateMobxObservable(state, importedState);
      }
    },
  };
}
