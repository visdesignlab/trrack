import { initProvenance } from "./provenance-core/Provenance";

export { initProvenance } from "./provenance-core/Provenance";

export { initProvenanceRedux } from "./provenance-core/ProvenanceRedux";

export { Provenance, ProvenanceRedux } from "./provenance-core/ProvenanceCore";

export {
  RecordableReduxAction,
  recordableReduxActionCreator
} from "./provenance-core/ActionHelpers/RecordableReduxActions";

export {
  RecordableAction
} from "./provenance-core/ActionHelpers/RecordableAction";

export function initialize(state: any) {
  return initProvenance(state);
}
