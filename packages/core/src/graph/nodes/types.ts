import { Action } from '../../action/types';

type NodeType = 'RootNode' | 'ActionNode' | 'StateNode';

export type BaseNode = {
  id: string;
  type: NodeType;
  children: string[];
  createdOn: number;
  lastVisited: number;
  parent: string;
  label: string;
};

export type RootNode = BaseNode & {
  type: 'RootNode';
  parent: 'None';
};

export type ActionNode = BaseNode & {
  type: 'ActionNode';
  action: Action;
  results: any;
};

export type ProvenanceNode = RootNode | ActionNode;
