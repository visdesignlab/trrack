const applyDiff = require('deep-diff').applyDiff;
import { ProvenanceGraph } from './ProvenanceGraph';

export type NodeID = string;

export interface NodeMetadata<S> {
  createdOn?: number;
  type?: S | 'Root';
  [key: string]: any;
}

interface DiffAnyProps {
  [key: string]: any;
}

export type Diff = DiffAnyProps & {
  path: string[];
};

export interface Extra<A> {
  time: number;
  e: A;
}

export interface Artifacts<A> {
  diffs?: Diff[];
  extra: Extra<A>[];
  [key: string]: any;
}

export interface BaseNode<T, S> {
  id: NodeID;
  label: string;
  metadata: NodeMetadata<S>;
  children: NodeID[];
}

export interface RootNode<T, S> extends BaseNode<T, S> {
  state: T;
}

export interface ChildNode<T, S, A> {
  parent: NodeID;
  artifacts: Artifacts<A>;
}

export interface StateNode<T, S, A> extends RootNode<T, S>, ChildNode<T, S, A> {}

export interface ActionNode<T, S, A> extends BaseNode<T, S>, ChildNode<T, S, A> {
  diffs: Diff[];
  lastStateNode: NodeID;
}

export type ProvenanceNode<T, S, A> = RootNode<T, S> | StateNode<T, S, A> | ActionNode<T, S, A>;

export type Nodes<T, S, A> = { [key: string]: ProvenanceNode<T, S, A> };

export type CurrentNode<T, S, A> = ProvenanceNode<T, S, A>;

export function isStateNode<T, S, A>(node: ProvenanceNode<T, S, A>): node is StateNode<T, S, A> {
  return 'state' in node && 'parent' in node;
}

export function isActionNode<T, S, A>(node: ProvenanceNode<T, S, A>): node is ActionNode<T, S, A> {
  return 'diffs' in node;
}

export function isChildNode<T, S, A>(
  node: ProvenanceNode<T, S, A>
): node is ActionNode<T, S, A> | StateNode<T, S, A> {
  return 'parent' in node;
}

export function getState<T, S, A>(
  graph: ProvenanceGraph<T, S, A>,
  node: ProvenanceNode<T, S, A>
): T {
  if (isActionNode(node)) {
    let previousState = (graph.nodes[node.lastStateNode] as StateNode<T, S, A>).state;

    // console.log(previousState)

    // diffs.forEach((diff: Diff) => {
    //   const pathArr = diff.path;
    //   const changedPaths: string[] = [];
    //
    //   const diffStr = pathArr.join('|');
    //   if (!diffStrings.includes(diffStr)) {
    //     diffStrings.push(diffStr);
    //   } else {
    //     return;
    //   }
    //
    //   pathArr.forEach(path => {
    //     if (changedPaths.length === 0) {
    //       changedPaths.push(path);
    //     } else {
    //       changedPaths.push([changedPaths.reverse()[0], path].join('|'));
    //     }
    //   });
    //
    //   changedPaths.reverse().forEach(cp => {
    //     if (eventRegistry[cp]) {
    //       eventRegistry[cp].forEach(f => f(state));
    //     }
    //   });
    // });

    return previousState;
  } else {
    return node.state;
  }
}
