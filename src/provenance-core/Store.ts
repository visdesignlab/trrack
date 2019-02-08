import { ProvenanceGraph } from "./ProvenanceGraph";
import { createStore, Store } from "redux";
import { Reducers } from "./Reducers";

export function configureStore(state: ProvenanceGraph): Store<ProvenanceGraph> {
  return createStore<ProvenanceGraph, null, null, null>(Reducers, state);
}
