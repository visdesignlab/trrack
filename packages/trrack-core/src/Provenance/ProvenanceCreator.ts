import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { action, computed, configure, makeAutoObservable, reaction, toJS } from 'mobx';
import { ProvenanceGraph } from '..';
import { ApplyObject } from '../Types/Action';
import { getState, isChildNode, ProvenanceNode, RootNode } from '../Types/Nodes';
import { GlobalObserver } from '../Types/Observers';
import { Provenance, ProvenanceOpts } from '../Types/Provenance';
import { JsonValue, Serializer } from '../Types/Serializers';
import defaultDeserializer from '../Utils/defaultDeserializer';
import defaultSerializer from '../Utils/defaultSerializer';
import generateTimeStamp from '../Utils/generateTimeStamp';
import { NodeID } from './../Types/Nodes';
import { ChangeType, ObserverEffect, ObserverExpression } from './../Types/Observers';
import {
  applyActionFunction,
  createProvenanceGraph,
  goToNode,
  importState,
} from './ProvenanceGraphFunction';

configure({
  enforceActions: 'always',
  isolateGlobalState: true,
});

const PROVSTATEKEY = 'provState';

function createStore<T, S, A>(initState: T, serializer: Serializer<T>) {
  const obs = makeAutoObservable(createProvenanceGraph<S, A>(serializer(initState)));
  return obs;
}

/**
 * @template T Represents the given state of an application as defined in initProvenance.
 * @template S Represents the given event types in your application.
 * Event types are used to differentiate between different actions that create nodes.
 * @template A Represents the given "extra" type for storing metadata.
 * Extra is a way to store customized metadata.
 * @param initialState: Initial state for the provenance graph to be created in.
 *  State of the root node.
 * @param _opts: Specify whether or not to loadFromUrl, or utilize firebase integration.
 */
export default function initProvenance<T, S, A = void>(
  initialState: T,
  _opts: Partial<ProvenanceOpts<T>> = {},
): Provenance<T, S, A> {
  const opts: ProvenanceOpts<T> = {
    loadFromUrl: false,
    firebaseConfig: null,
    _serializer: undefined,
    _deserializer: undefined,
    ..._opts,
  };

  let setupFinished = false;

  const { loadFromUrl, _serializer, _deserializer } = opts;

  const serializer = _serializer !== undefined ? _serializer : defaultSerializer;

  const deserializer = _deserializer !== undefined ? _deserializer : defaultDeserializer;

  const graph = createStore<T, S, A>(initialState, serializer);

  const state = computed(() => deserializer(getState(graph, graph.nodes[graph.current])));

  if (loadFromUrl)
    reaction(
      () => state.get(),
      (state) => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const stateEncodedString = compressToEncodedURIComponent(JSON.stringify(serializer(state)));
        params.set(PROVSTATEKEY, stateEncodedString);
        window.history.replaceState({}, '', `${url.pathname}?${params}`);
      },
    );

  return {
    get state() {
      return state.get();
    },
    get config() {
      return opts;
    },
    get graph() {
      return graph;
    },
    get current() {
      return graph.nodes[graph.current];
    },
    get root() {
      return graph.nodes[graph.root] as RootNode<S>;
    },
    get usingDefaultSerializer() {
      return _serializer === undefined && _deserializer === undefined;
    },
    apply(action: ApplyObject<T, S>, label?: string) {
      if (!setupFinished)
        throw new Error(
          'Provenance setup not finished. Please call done function on provenance object after setting up any observers.)',
        );

      applyActionFunction(graph, action, state.get(), serializer, label);
      // ! Add firebase
    },
    addGlobalObserver(observer: GlobalObserver<S, A>) {
      reaction(
        () => toJS(graph),
        (currentGraph, previousGraph) => {
          let change: ChangeType = 'Any';
          if (Object.keys(currentGraph.nodes).length > Object.keys(previousGraph.nodes).length)
            change = 'NodeAdded';
          else if (currentGraph.current !== previousGraph.current) change = 'CurrentChanged';

          observer(currentGraph, change);
        },
      );
    },
    addObserver<P>(expression: ObserverExpression<T, P>, effect: ObserverEffect<P>) {
      reaction(
        () => {
          return JSON.stringify(expression(state.get()));
        },
        (current, previous) => {
          return effect(JSON.parse(current), JSON.parse(previous));
        },
      );
    },
    goToNode(id: NodeID) {
      goToNode(graph, id);
    },
    addArtifact: action('Add Artifact Action', (artifact: A, _id?: NodeID) => {
      let id = graph.current;
      if (_id) id = _id;

      const node = graph.nodes[id];

      if (isChildNode(node)) {
        node.artifacts.customArtifacts.push({
          timestamp: generateTimeStamp(),
          artifact,
        });
      }
    }),
    addAnnotation: action('Add Annotation Action', (annotation: string, _id?: NodeID) => {
      let id = graph.current;
      if (_id) id = _id;

      const node = graph.nodes[id];

      if (isChildNode(node)) {
        node.artifacts.annotations.push({
          timestamp: generateTimeStamp(),
          annotation,
        });
      }
    }),
    getAllArtifacts(_id?: NodeID) {
      let id = graph.current;
      if (_id) id = _id;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        return toJS(node.artifacts.customArtifacts);
      }
      return [];
    },
    getLatestArtifact(_id?: NodeID) {
      let id = graph.current;
      if (_id) id = _id;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        const arts = node.artifacts.customArtifacts;
        return toJS(arts[arts.length - 1]);
      }
      return null;
    },
    getAllAnnotation(_id?: NodeID) {
      let id = graph.current;
      if (_id) id = _id;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        return toJS(node.artifacts.annotations);
      }
      return [];
    },
    getLatestAnnotation(_id?: NodeID) {
      let id = graph.current;
      if (_id) id = _id;
      const node = graph.nodes[id];

      if (isChildNode(node)) {
        const { annotations } = node.artifacts;
        return toJS(annotations[annotations.length - 1]);
      }
      return null;
    },
    undo() {
      const current = this.current;
      if (!isChildNode(current)) console.warn('Already at Root');
      else goToNode(graph, current.parent);
    },
    redo(to: 'latest' | 'oldest' = 'latest') {
      const current = this.current;

      if (current.children.length === 0) {
        console.warn('Already at latest node in this branch.');
      } else {
        let id = current.children[current.children.length - 1];
        if (to === 'oldest') id = current.children[0];

        goToNode(graph, id);
      }
    },
    goBackOneStep() {
      this.undo();
    },
    goForwardOneStep(to: 'latest' | 'oldest' = 'latest') {
      this.redo(to);
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
          const parentNode: ProvenanceNode<S, A> = graph.nodes[parent];
          if (!isChildNode(parentNode)) break;
          parent = parentNode.parent;
        }

        goToNode(graph, parent);
      }
    },
    redoNonEphemeral(to: 'latest' | 'oldest' = 'latest') {
      this.goForwardToNonEphemeral(to);
    },
    goForwardToNonEphemeral(to: 'latest' | 'oldest' = 'latest') {
      let child: NodeID | null = null;
      const current = graph.nodes[graph.current];

      if (current.children.length === 0) {
        throw new Error('Already at latest node.');
      }
      child = current.children[to === 'latest' ? current.children.length - 1 : 0];

      while (graph.nodes[child].actionType === 'Ephemeral') {
        const childNode: ProvenanceNode<S, A> = graph.nodes[child];
        if (childNode.children.length === 0) break;
        child = childNode.children[to === 'latest' ? childNode.children.length - 1 : 0];
      }

      goToNode(graph, child);
    },
    reset() {
      goToNode(graph, graph.root);
    },
    setBookmark: action('Bookmark Action', (id: NodeID, bookmark: boolean) => {
      graph.nodes[id].bookmarked = bookmark;
    }),
    getBookmark(id: NodeID) {
      return graph.nodes[id].bookmarked;
    },
    getAllBookmarks() {
      return Object.entries(graph.nodes)
        .filter((entry) => entry[1].bookmarked)
        .map((d) => d[0] as NodeID);
    },
    exportState(partial = false) {
      let exportedState: JsonValue = {};

      const currentState = getState(graph, this.current);

      const initState = serializer(initialState);

      if (partial) {
        Object.keys(initState).forEach((k) => {
          const prev = initState[k];
          const curr = currentState[k];
          if (JSON.stringify(prev) !== JSON.stringify(curr)) {
            exportedState = { ...exportedState, [k]: currentState[k] };
          }
        });
      } else {
        exportedState = currentState;
      }

      const compressedString = compressToEncodedURIComponent(JSON.stringify(exportedState));

      return compressedString;
    },
    importState(s: string | JsonValue) {
      let state: JsonValue;
      if (typeof s === 'string') {
        state = JSON.parse(decompressFromEncodedURIComponent(s) || '{}');
      } else {
        state = { ...this.state, ...s };
      }

      importState(graph, state);
    },
    exportProvenanceGraph() {
      return JSON.stringify(toJS(graph));
    },
    importProvenanceGraph: action(
      'Import Provenance Graph',
      (g: string | ProvenanceGraph<S, A>) => {
        let importedGraph: ProvenanceGraph<S, A>;
        if (typeof g === 'string') importedGraph = JSON.parse(g);
        else importedGraph = g;

        graph.current = importedGraph.current;
        graph.root = importedGraph.root;
        graph.nodes = importedGraph.nodes;
      },
    ),
    getState(node: ProvenanceNode<S, A> | NodeID) {
      let n: ProvenanceNode<S, A>;
      if (typeof node === 'string') {
        n = graph.nodes[node];
      } else {
        n = node;
      }

      return deserializer(getState(graph, n));
    },
    done() {
      setupFinished = true;
      if (loadFromUrl) {
        if (!window?.location?.href)
          throw new Error('loadFromUrl option can only be used in a browser environment');

        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const importString = params.get(PROVSTATEKEY);
        if (!importString) return;

        this.importState(importString);
      }
    },
  };
}
