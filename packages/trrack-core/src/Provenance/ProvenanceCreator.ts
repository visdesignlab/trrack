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
import { Provenance, ProvenanceOpts } from '../Types/Provenance';
import { ApplyObject } from '../Types/Action';
import {
  GlobalObserver,
  ObserverEffect,
  ObserverExpression,
} from '../Types/Observers';
import generateTimeStamp from '../Utils/generateTimeStamp';
import { ProvenanceGraph } from '../Types/ProvenanceGraph';
import { initializeFirebase, logToFirebase } from './FirebaseFunctions';

configure({ enforceActions: 'observed', isolateGlobalState: true });

function setupSerializer() {
  const serialize = (obj: any): string => {
    const str = JSON.stringify(obj, (_, val) => {
      if (val instanceof Set) {
        return {
          type: 'Set',
          arr: Array.from(val),
        };
      }
      return val;
    });
    return str;
  };
  const deserialize = (str: string): any => {
    const obj: any = JSON.parse(str, (_, val) => {
      if (val.type && val.type === 'Set') {
        return new Set(val.arr);
      }
      return val;
    });

    return obj;
  };

  return { serialize, deserialize };
}

export default function initProvenance<T, S, A = void>(
  initialState: T,
  _opts: Partial<ProvenanceOpts> = {
    loadFromUrl: true,
    firebaseConfig: null,
  },
): Provenance<T, S, A> {
  const opts: ProvenanceOpts = {
    loadFromUrl: true,
    firebaseConfig: null,
    ..._opts,
  };
  const { loadFromUrl, firebaseConfig } = opts;

  let setupFinished: boolean = false;
  const state = observable(initialState);
  const graph = observable(createProvenanceGraph<T, S, A>(toJS(state)));

  const PROVSTATEKEY = 'provState';

  const { serialize, deserialize } = setupSerializer();

  // eslint-disable-next-line no-unused-vars
  let firebaseLogger: (g: ProvenanceGraph<T, S, A>) => void;
  if (firebaseConfig) {
    const firebase = initializeFirebase(firebaseConfig);
    firebaseLogger = logToFirebase(firebase.db);
  }

  if (loadFromUrl) {
    reaction(
      () => toJS(state),
      (st) => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const stateEncodedString = compressToEncodedURIComponent(serialize(st));
        params.set(PROVSTATEKEY, stateEncodedString);
        window.history.replaceState({}, '', `${url.pathname}?${params}`);
      },
    );
  }

  return {
    get state() {
      return toJS(state);
    },
    get config() {
      return opts;
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
    apply(act: ApplyObject<T, S>) {
      if (!setupFinished) {
        throw new Error(
          'Provenance setup not finished. Please call done function on provenance object after setting up any observers.)',
        );
      }
      applyActionFunction(graph, act, state);
      if (firebaseConfig) {
        firebaseLogger(toJS(graph));
      }
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
    addArtifact: action((artifact: A, id?: NodeID) => {
      if (!id) id = graph.current;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        node.artifacts.customArtifacts.push({
          timestamp: generateTimeStamp(),
          artifact,
        });
      }
    }),
    addAnnotation: action((annotation: string, id?: NodeID) => {
      if (!id) id = graph.current;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        node.artifacts.annotations.push({
          timestamp: generateTimeStamp(),
          annotation,
        });
      }
    }),
    getAllArtifacts(id?: NodeID) {
      if (!id) id = graph.current;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        return node.artifacts.customArtifacts;
      }
      return [];
    },
    getLatestArtifact(id?: NodeID) {
      if (!id) id = graph.current;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        const arts = node.artifacts.customArtifacts;
        return arts[arts.length - 1];
      }
      return null;
    },
    getAllAnnotation(id?: NodeID) {
      if (!id) id = graph.current;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        return node.artifacts.annotations;
      }
      return [];
    },
    getLatestAnnotation(id?: NodeID) {
      if (!id) id = graph.current;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        const { annotations } = node.artifacts;
        return annotations[annotations.length - 1];
      }
      return null;
    },
    undo() {
      this.goBackOneStep();
    },
    goBackOneStep() {
      const current = graph.nodes[graph.current];
      if (!isChildNode(current)) throw new Error('Already at root');
      goToNode(graph, state, current.parent);
    },
    redo(to: 'latest' | 'oldest' = 'latest') {
      this.goForwardOneStep(to);
    },
    goForwardOneStep(to: 'latest' | 'oldest' = 'latest') {
      const current = graph.nodes[graph.current];
      if (current.children.length === 0) throw new Error('Already at latest node in this branch');
      if (to === 'oldest') goToNode(graph, state, current.children[0]);
      else goToNode(graph, state, current.children[current.children.length - 1]);
    },
    undoNonEphemeral() {
      this.goBackToNonEphemeral();
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
    redoNonEphemeral(to: 'latest' | 'oldest' = 'latest') {
      this.goForwardToNonEphemeral(to);
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
        serialize(exportedState),
      );

      return compressedString;
    },
    importState(s: string | Partial<T>) {
      let st: T;
      if (typeof s === 'string') st = deserialize(decompressFromEncodedURIComponent(s) || '') as any;
      else st = { ...toJS(state), ...s };

      updateMobxObservable(state, st);
      importState(graph, st);
    },
    importProvenanceGraph(g: string | ProvenanceGraph<T, S, A>) {
      let gg: ProvenanceGraph<T, S, A>;
      if (typeof g === 'string') {
        gg = deserialize(g) as ProvenanceGraph<T, S, A>;
      } else {
        gg = g;
      }
      updateMobxObservable(graph, gg);
    },
    exportProvenanceGraph() {
      return serialize(toJS(graph));
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
        let importedState: T = deserialize(
          decompressFromEncodedURIComponent(importString) || '',
        ) as any;

        importedState = { ...toJS(state), ...importedState };

        importState(graph, importedState);
        updateMobxObservable(state, importedState);
      }
    },
  };
}
