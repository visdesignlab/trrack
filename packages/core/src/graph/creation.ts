import { Action } from '../action/types';
import { getUUID } from '../utils/uuid-generator';
import { PROV_VERSION } from '../utils/version';
import { ActionNode, ProvenanceNode, RootNode } from './nodes';
import { ProvenanceGraph } from './types';

export function createRootNode(): RootNode {
  const timeStamp = Date.now();
  return {
    id: getUUID(),
    parent: 'None',
    children: [],
    type: 'RootNode',
    label: 'Root',
    createdOn: timeStamp,
    lastVisited: timeStamp,
  };
}

export function createProvenanceGraph(
  sessionName?: string,
  authors?: string[]
): ProvenanceGraph {
  const root = createRootNode();

  const nodes = {
    [root.id]: root,
  };

  const graph: ProvenanceGraph = {
    current: root.id,
    root: root.id,
    nodes,
    PROV_VERSION,
  };

  if (sessionName) {
    graph.sessionName = {
      value: sessionName,
      lastModified: root.createdOn,
    };
  }

  if (authors) {
    graph.authors = {
      value: authors,
      lastModified: root.createdOn,
    };
  }

  return graph;
}

export function addNewActionNode(
  label: string,
  action: Action,
  parent: ProvenanceNode,
  results?: any
): ActionNode {
  const timeStamp = Date.now();

  const actionNode: ActionNode = {
    id: getUUID(),
    children: [],
    label,
    createdOn: timeStamp,
    action,
    parent: parent.id,
    type: 'ActionNode',
    results,
    lastVisited: timeStamp,
  };

  parent.children.push(actionNode.id);

  return actionNode;
}
