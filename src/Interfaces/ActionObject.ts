import { NodeMetadata, Artifacts } from './NodeInterfaces';
import Provenance, { ActionFunction } from './Provenance';
import { ProvenanceGraph } from './ProvenanceGraph';

export class Action<T, S, A> {
  label: string;
  action: ActionFunction<T>;
  args?: any[];
  metadata: NodeMetadata<S>;
  artifacts?: Artifacts<A>;
  eventType?: S;
  complex?: boolean;
  prov: Provenance<T, S, A>;

  constructor(label: string, a: ActionFunction<T>, prov: Provenance<T, S, A>) {
    this.label = label;
    this.action = a;
    this.args = undefined;
    this.metadata = {};
    this.artifacts = undefined;
    this.eventType = undefined;
    this.complex = false;
    this.prov = prov;
  }

  addLabel(label: string): Action<T, S, A> {
    this.label = label;
    return this;
  }

  addAction(action: ActionFunction<T>): Action<T, S, A> {
    this.action = action;
    return this;
  }

  addArgs(args: any[]): Action<T, S, A> {
    this.args = args;
    return this;
  }

  addMetadata(metadata: NodeMetadata<S>): Action<T, S, A> {
    this.metadata = metadata;
    return this;
  }

  addArtifacts(artifacts: Artifacts<A>): Action<T, S, A> {
    this.artifacts = artifacts;
    return this;
  }

  addEventType(eventType: S): Action<T, S, A> {
    this.eventType = eventType;
    return this;
  }

  alwaysStoreState(b: boolean): Action<T, S, A> {
    this.complex = b;
    return this;
  }

  applyAction() {
    this.prov.applyAction(
      this.label,
      this.action,
      this.args,
      this.metadata,
      this.artifacts,
      this.eventType,
      this.complex
    );
  }
}
