import { Diff, applyChange } from 'deep-diff';
import { ActionType } from './Action';
import { ProvenanceGraph } from './ProvenanceGraph';
import deepCopy from '../Utils/DeepCopy';

export type NodeID = string;

export type Meta = { [key: string]: any };

export type NodeMetadata<S> = {
  createdOn?: number;
  eventType: S | 'Root';
} & Meta;

export interface Extra<A = void> {
  time: number;
  e: A;
}

export interface Artifacts<A, LHS, RHS = LHS> {
  diffs?: Diff<LHS, RHS>[];
  annotation?: string;
  extra: Extra<A>[];
}

export interface BaseNode<S> {
  id: NodeID;
  label: string;
  metadata: NodeMetadata<S>;
  children: NodeID[];
  actionType: ActionType;
  bookmarked: boolean;
}

export interface RootNode<T, S> extends BaseNode<S> {
  state: T;
}

export interface ChildNode<T, S, A> extends BaseNode<S> {
  parent: NodeID;
  artifacts: Artifacts<A, T, T>;
}

export interface StateNode<T, S, A>
  extends RootNode<T, S>,
    ChildNode<T, S, A> {}

export interface DiffNode<T, S, A> extends ChildNode<T, S, A> {
  diffs: Diff<T>[];
  lastStateNode: NodeID;
}

export type ProvenanceNode<T, S, A> =
  | RootNode<T, S>
  | StateNode<T, S, A>
  | DiffNode<T, S, A>;

export type Nodes<T, S, A> = { [key: string]: ProvenanceNode<T, S, A> };

export type CurrentNode<T, S, A> = ProvenanceNode<T, S, A>;

export function isStateNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is StateNode<T, S, A> {
  return 'parent' in node && 'state' in node;
}

export function isDiffNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is DiffNode<T, S, A> {
  return 'diffs' in node;
}

export function isChildNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is DiffNode<T, S, A> | StateNode<T, S, A> {
  return 'parent' in node;
}

export function isRootNode<T, S, A>(
  node: ProvenanceNode<T, S, A>,
): node is RootNode<T, S> {
  return node.label === 'Root';
}

function getPath<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  start: ProvenanceNode<T, S, A>,
  end: ProvenanceNode<T, S, A>,
  track: NodeID[] = [],
  comingFrom = start,
) {
  if (start && start.id === end.id) {
    track.unshift(start.id);
    return true;
  }
  if (start) {
    const nodesToCheck = [...start.children];
    if (isChildNode(start)) {
      nodesToCheck.push(start.parent);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const node of nodesToCheck) {
      // eslint-disable-next-line no-continue
      if (node === comingFrom.id) continue;
      if (getPath(graph, graph.nodes[node], end, track, start)) {
        track.unshift(start.id);
        return true;
      }
    }
  }

  return false;
}

export function getState<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  node: ProvenanceNode<T, S, A>,
): T {
  if (isRootNode(node) || isStateNode(node)) {
    return node.state;
  }

  getPath(graph, graph.nodes[graph.current], node, []);

  // eslint-disable-next-line no-underscore-dangle
  const _state = (graph.nodes[node.lastStateNode] as StateNode<T, S, A>).state;

  const state = deepCopy(_state);

  node.diffs.forEach((diff) => {
    applyChange(state, null, diff);
  });

  return state;
}
