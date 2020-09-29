import { configure, observable, reaction, toJS } from 'mobx';
import { applyActionFunction, createProvenanceGraph, goToNode } from './ProvenanceGraphFunction';
import { NodeID, RootNode } from '../Interfaces/NodeInterfaces';
import { Provenance } from '../Interfaces/Provenance';
import { ActionObject } from '../Interfaces/Action';
import { GlobalObserver, Observer } from '../Interfaces/Observers';

type ProvenanceOpts = {
  loadFromUrl: boolean;
  firebaseOpts: {
    storeOnFirebase: boolean;
    config: any;
  };
};

configure({ enforceActions: 'always' });

export default function initProvenance<T, S = void, A = void>(
  initalState: T,
  opts: ProvenanceOpts = {
    loadFromUrl: true,
    firebaseOpts: { storeOnFirebase: false, config: null },
  }
): Provenance<T, S, A> {
  let state = observable(initalState);
  const graph = observable(createProvenanceGraph<T, S, A>(toJS(state)));

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
    apply(action: ActionObject<T>) {
      applyActionFunction(graph, action, state);
    },
    addGlobalObserver(observer: GlobalObserver<T, S, A>) {
      reaction(
        () => toJS(graph),
        (graph) => observer(graph)
      );
    },
    addObserver(path: string, observer: Observer<T>) {
      const pathArray = path.split('.') as (keyof T)[];
      reaction(
        () => pathArray.reduce((obj: any, v: keyof T) => obj[v], toJS(state)),
        (data) => {
          observer(data);
        }
      );
    },
    goToNode(id: NodeID) {
      goToNode(graph, state, id);
    },
  };
}
