import { NodeMetadata, Artifacts, Extra } from './NodeInterfaces';
import Provenance, { ActionFunction } from './Provenance';
import { ProvenanceGraph } from './ProvenanceGraph';

export class Action<T, S, A> {
  label: string;
  action: ActionFunction<T>;
  args?: any[];
  metadata: NodeMetadata<S>;
  artifacts: Artifacts<A>;
  eventType?: S;
  complex?: boolean;
  ephemeral?: boolean;
  prov: Provenance<T, S, A>;

  /**
   * Creates a new Action with the given label and Action Function. Not intended to be a public function.
   */
  constructor(label: string, a: ActionFunction<T>, prov: Provenance<T, S, A>) {
    this.label = label;
    this.action = a;
    this.args = undefined;
    this.metadata = {};
    this.artifacts = {
      extra: []
    };
    this.eventType = undefined;
    this.complex = false;
    this.prov = prov;
  }

  /**
   * Edits the label associated with this action
   */
  addLabel(label: string): Action<T, S, A> {
    this.label = label;
    return this;
  }

  /**
   * Edits the action function associated with this function.
   * The action function is the function that changes the state of the new node.
   * See Provenance.ts for more documentation on the ActionFunction type.
   */
  addAction(action: ActionFunction<T>): Action<T, S, A> {
    this.action = action;
    return this;
  }

  /**
   * Adds arguments to be sent to the ActionFunction as extra parameters.
   */
  addArgs(args: any[]): Action<T, S, A> {
    this.args = args;
    return this;
  }

  /**
   * Changes the metadata object associated with this action.
   * See Provenance.ts for more documentation on the NodeMetadata type.
   */
  addMetadata(metadata: NodeMetadata<S>): Action<T, S, A> {
    this.metadata = metadata;
    return this;
  }

  /**
   * Changes the Artifacts object associated with this action.
   * See Provenance.ts for more documentation on the Artifacts type.
   */
  addArtifacts(artifacts: Artifacts<A>): Action<T, S, A> {
    this.artifacts = artifacts;
    return this;
  }

  addExtra(extra: A) {
    this.artifacts.extra.push({
      time: Date.now(),
      e: extra
    });

    return this;
  }

  /**
   * Changes the event type within the NodeMetadata object associated with this action
   * See Provenance.ts for more documentation on the NodeMetadata type.
   */
  addEventType(eventType: S): Action<T, S, A> {
    this.eventType = eventType;
    return this;
  }

  /**
   * Tells provenance whether or not you want to store the entire state of the application on this node,
   * or if you would like to store a diff from the last state node. If true, the entire state will always be stored.
   * If false, the entire state will only be stored when deemed necessary based on the difference from the previos state.
   *
   * There is no difference in how you interact with this node. False by default.
   */
  alwaysStoreState(b: boolean): Action<T, S, A> {
    this.complex = b;
    return this;
  }

  /**
   * Tells provenance whether or not you want to store the entire state of the application on this node,
   * or if you would like to store a diff from the last state node. If true, the entire state will always be stored.
   * If false, the entire state will only be stored when deemed necessary based on the difference from the previos state.
   *
   * There is no difference in how you interact with this node. False by default.
   */
  isEphemeral(b: boolean): Action<T, S, A> {
    this.ephemeral = b;
    return this;
  }

  /**
   * Applies this action the provenance graph. Results in a node being created and set as the current node.
   */
  applyAction() {
    this.prov.applyAction(
      this.label,
      this.action,
      this.args,
      this.metadata,
      this.artifacts,
      this.eventType,
      this.complex,
      this.ephemeral
    );
  }
}
