import { ProvenanceGraph } from "./ProvenanceGraph";
import { createStore, Store } from "redux";
import { Reducers } from "./Reducers";

export function configureStore<T>(
  state: ProvenanceGraph<T>
): Store<ProvenanceGraph<T>> {
  return createStore<any, null, null, null>(Reducers, state as any);
}
